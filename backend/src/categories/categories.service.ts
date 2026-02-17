/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-useless-escape */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schemas/Categories.schema';
import { CreateCategoryDto } from './dtos/CreateCategory.dto';
import { Product } from 'src/schemas/Products.schema';
import { UpdateCategoryDto } from './dtos/UpdateCategory.dto';
import { MoveCategoryDto } from './dtos/MoveCategory.dto';
import { uploadBufferToCloudinary } from 'src/utils/cloudinary/upload.util';
import { EntityType } from 'src/schemas/Permissions.schema';
import { PermissionsService } from 'src/permissions/permissions.service';
import { UsersService } from 'src/users/users.service';
import { Group } from 'src/schemas/Groups.schema';
import mongoose from 'mongoose';
import { NameLock } from 'src/schemas/NameLock.schema';
import { normalizeName } from 'src/utils/nameLock';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(NameLock.name) private nameLockModel: Model<NameLock>,
    private readonly permissionsService: PermissionsService,
    private readonly usersService: UsersService,
  ) {}
  nameKey = normalizeName(CreateCategoryDto.prototype.categoryName);

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    file?: Express.Multer.File,
  ) {
    if (file?.buffer) {
      const uploaded = await uploadBufferToCloudinary(
        file.buffer,
        'stockbox/categories',
      );
      createCategoryDto.categoryImage = uploaded.secure_url;
    }

    const nameKey = normalizeName(createCategoryDto.categoryName);
    try {
      await this.nameLockModel.create({
        nameKey,
        type: 'category',
        refId: 'pending',
      });
    } catch (err: any) {
      if (err?.code === 11000 || /duplicate key/i.test(err?.message || '')) {
        throw new BadRequestException(
          'שם זה כבר קיים. נא לבחור שם ייחודי אחר.',
        );
      }
      throw err;
    }
    const newCategory = new this.categoryModel({
      ...createCategoryDto,
      nameKey,
    });

    try {
      const savedCategory = await newCategory.save();

      await this.nameLockModel.updateOne(
        { nameKey },
        { $set: { refId: savedCategory._id.toString() } },
      );

      await this.permissionsService.assignPermissionsForNewEntity(
        savedCategory,
      );

      return savedCategory;
    } catch (err: any) {
      await this.nameLockModel.deleteOne({ nameKey }).catch(() => undefined);
      if (err?.code === 11000 || /duplicate key/i.test(err?.message || '')) {
        throw new BadRequestException(
          'שם זה כבר קיים. נא לבחור שם ייחודי אחר.',
        );
      }

      throw err;
    }
  }

  async getCategoryByPath(categoryPath: string, user: any): Promise<Category> {
    const fullPath = categoryPath.startsWith('/categories/')
      ? categoryPath
      : `/categories/${categoryPath}`;

    const category = await this.categoryModel.findOne({
      categoryPath: fullPath,
    });

    if (!category) {
      throw new NotFoundException(`Category not found at path: ${fullPath}`);
    }

    return category;
  }

  async getCategories(user: { userId: string; role: string }) {
    const categories = await this.categoryModel.find({
      categoryPath: /^\/categories\/[^\/]+$/,
    });

    if (user.role === 'editor') {
      return categories;
    }

    if (user.role !== 'viewer') {
      return [];
    }

    const { userGroupIds, allowedByEntityId } =
      await this.buildAllowedMapForUser(user);

    const visibleCategories = categories.filter((cat) =>
      this.hasCategoryPermission(
        cat._id.toString(),
        user,
        userGroupIds,
        allowedByEntityId,
      ),
    );

    return visibleCategories;
  }

  async getDirectChildren(
    categoryPath: string,
    user: { userId: string; role: string },
  ) {
    if (!categoryPath) return [];

    let cleanPath = categoryPath;
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

    const fullPath = `/categories/${cleanPath}`;

    const currentCategory = await this.categoryModel
      .findOne({ categoryPath: fullPath })
      .select('_id categoryPath categoryName')
      .lean();

    if (!currentCategory) {
      throw new NotFoundException('Category not found');
    }

    if (user.role === 'editor') {
      const allCategoryChildren = await this.categoryModel.find({
        categoryPath: new RegExp(
          `^${fullPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`,
        ),
      });

      return allCategoryChildren.filter((cat) => {
        const remainingPath = cat.categoryPath.substring(fullPath.length + 1);
        return !remainingPath.includes('/');
      });
    }

    if (user.role !== 'viewer') return [];

    const { userGroupIds, allowedByEntityId } =
      await this.buildAllowedMapForUser(user);

    const currentCategoryId = currentCategory._id.toString();

    if (
      !this.hasCategoryPermission(
        currentCategoryId,
        user,
        userGroupIds,
        allowedByEntityId,
      )
    ) {
      throw new ForbiddenException('No permission to view this category');
    }
    const allCategoryChildren = await this.categoryModel.find({
      categoryPath: new RegExp(
        `^${fullPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`,
      ),
    });

    const directCategoryChildren = allCategoryChildren.filter((cat) => {
      const remainingPath = cat.categoryPath.substring(fullPath.length + 1);
      return !remainingPath.includes('/');
    });

    const visibleChildren = directCategoryChildren.filter((child) =>
      this.hasCategoryPermission(
        child._id.toString(),
        user,
        userGroupIds,
        allowedByEntityId,
      ),
    );

    return visibleChildren;
  }

  async deleteCategory(
    id: string,
    strategy: 'cascade' | 'move_up' = 'cascade',
  ) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const categoryPath = category.categoryPath;
    const parentPath = this.getParentPath(categoryPath);

    const escapedCategoryPath = categoryPath.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );

    if (strategy === 'cascade') {
      await this.permissionsService.deletePermissionsForEntity(
        EntityType.CATEGORY,
        id,
        { cascade: true },
      );
      await this.categoryModel.deleteMany({
        categoryPath: new RegExp(`^${escapedCategoryPath}/`),
      });

      await this.productModel.deleteMany({
        productPath: new RegExp(`^${escapedCategoryPath}`),
      });

      await this.categoryModel.findByIdAndDelete(id);

      return {
        success: true,
        strategy,
        message: 'Category and all nested content deleted successfully',
        deletedCategoryPath: categoryPath,
      };
    }

    const newPrefix = parentPath;

    const subcategoriesToDelete = await this.categoryModel
      .find({ categoryPath: new RegExp(`^${escapedCategoryPath}/`) })
      .select('_id')
      .lean();

    await this.categoryModel.updateMany(
      { categoryPath: new RegExp(`^${escapedCategoryPath}/`) },
      [
        {
          $set: {
            categoryPath: {
              $concat: [
                newPrefix,
                {
                  $substr: [
                    '$categoryPath',
                    categoryPath.length,
                    { $strLenCP: '$categoryPath' },
                  ],
                },
              ],
            },
          },
        },
      ],
      { updatePipeline: true },
    );

    const productsToUpdate = await this.productModel.find({
      productPath: {
        $elemMatch: { $regex: new RegExp(`^${escapedCategoryPath}(/|$)`) },
      },
    });

    for (const product of productsToUpdate) {
      const updatedPaths = product.productPath.map((p) => {
        if (p.startsWith(categoryPath + '/')) {
          return newPrefix + p.substring(categoryPath.length);
        }

        if (p === categoryPath) {
          return newPrefix;
        }

        return p;
      });

      await this.productModel.updateOne(
        { _id: product._id },
        { $set: { productPath: updatedPaths } },
      );
    }

    await this.permissionsService.deletePermissionsForEntity(
      EntityType.CATEGORY,
      id,
    );
    await this.categoryModel.findByIdAndDelete(id);

    await this.usersService.removeItemFromAllUserFavorites(id);
    for (const subcat of subcategoriesToDelete) {
      await this.usersService.removeItemFromAllUserFavorites(
        subcat._id.toString(),
      );
    }

    return {
      success: true,
      strategy,
      message: 'Category deleted and nested entities moved one level up',
      deletedCategoryPath: categoryPath,
      movedTo: newPrefix,
    };
  }

  async getById(id: string) {
    const category = await this.categoryModel.findById(id).lean();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    const oldCategoryPath = category.categoryPath;

    let oldKey: string | null = null;
    let newKey: string | null = null;

    if (
      updateCategoryDto.categoryName &&
      updateCategoryDto.categoryName !== category.categoryName
    ) {
      oldKey = normalizeName(category.categoryName);
      newKey = normalizeName(updateCategoryDto.categoryName);
      if (!newKey) throw new BadRequestException('Invalid name');
      try {
        await this.nameLockModel.create({
          nameKey: newKey,
          type: 'category',
          refId: id,
        });
      } catch (e: any) {
        if (e?.code === 11000) {
          throw new BadRequestException(
            'שם זה כבר קיים. נא לבחור שם ייחודי אחר.',
          );
        }
        throw e;
      }
      (updateCategoryDto as any).nameKey = newKey;
      const parentPath = this.getParentPath(oldCategoryPath);

      const newSlug = this.slugify(updateCategoryDto.categoryName);

      const newCategoryPath = `${parentPath}/${newSlug}`;

      const dup = await this.categoryModel.findOne({
        categoryPath: newCategoryPath,
        _id: { $ne: id },
      });

      if (dup) {
        await this.nameLockModel
          .deleteOne({ nameKey: newKey })
          .catch(() => undefined);
        throw new BadRequestException(
          'שם זה כבר קיים. נא לבחור שם ייחודי אחר.',
        );
      }

      updateCategoryDto.categoryPath = newCategoryPath;
    }

    if (file?.buffer) {
      const uploaded = await uploadBufferToCloudinary(
        file.buffer,
        'stockbox/categories',
      );
      updateCategoryDto.categoryImage = uploaded.secure_url;
    }

    let updatedCategory;
    try {
      updatedCategory = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDto,
        { new: true },
      );
    } catch (e) {
      if (newKey)
        await this.nameLockModel
          .deleteOne({ nameKey: newKey })
          .catch(() => undefined);
      throw e;
    }

    if (!updatedCategory) {
      if (newKey)
        await this.nameLockModel
          .deleteOne({ nameKey: newKey })
          .catch(() => undefined);
      throw new NotFoundException('Category not found');
    }

    if (oldKey && newKey && oldKey !== newKey) {
      await this.nameLockModel
        .deleteOne({ nameKey: oldKey })
        .catch(() => undefined);
    }

    if (
      updateCategoryDto.categoryPath &&
      updateCategoryDto.categoryPath !== oldCategoryPath
    ) {
      const newCategoryPath = updateCategoryDto.categoryPath;

      await this.categoryModel.updateMany(
        { categoryPath: new RegExp(`^${oldCategoryPath}/`) },
        [
          {
            $set: {
              categoryPath: {
                $concat: [
                  newCategoryPath,
                  {
                    $substr: [
                      '$categoryPath',
                      oldCategoryPath.length,
                      { $strLenCP: '$categoryPath' },
                    ],
                  },
                ],
              },
            },
          },
        ],
        { updatePipeline: true },
      );

      const escapedOldPath = oldCategoryPath.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      const productsToUpdate = await this.productModel.find({
        productPath: {
          $elemMatch: { $regex: new RegExp(`^${escapedOldPath}`) },
        },
      });

      for (const product of productsToUpdate) {
        const updatedPaths = product.productPath.map((path) => {
          if (path.startsWith(oldCategoryPath)) {
            return newCategoryPath + path.substring(oldCategoryPath.length);
          }
          return path;
        });

        await this.productModel.updateOne(
          { _id: product._id },
          { $set: { productPath: updatedPaths } },
        );
      }
    }

    return updatedCategory;
  }

  async moveCategory(id: string, moveCategoryDto: MoveCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const oldPath = category.categoryPath;
    const { newParentPath } = moveCategoryDto;

    const pathSegments = oldPath.split('/').filter(Boolean);
    if (pathSegments.length <= 2) {
      throw new BadRequestException(
        'Cannot move main categories. Only subcategories can be moved.',
      );
    }

    const parentCategory = await this.categoryModel.findOne({
      categoryPath: newParentPath,
    });

    if (!parentCategory) {
      throw new BadRequestException('Target parent category does not exist');
    }

    if (newParentPath.startsWith(oldPath)) {
      throw new BadRequestException(
        'Cannot move category into itself or its children',
      );
    }

    const categoryName = oldPath.split('/').pop();

    const newPath = `${newParentPath}/${categoryName}`;

    const existingCategory = await this.categoryModel.findOne({
      categoryPath: newPath,
    });

    if (existingCategory) {
      throw new BadRequestException('שם זה כבר קיים. נא לבחור שם ייחודי אחר.');
    }

    category.categoryPath = newPath;
    await category.save();

    await this.categoryModel.updateMany(
      {
        categoryPath: new RegExp(
          `^${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`,
        ),
      },
      [
        {
          $set: {
            categoryPath: {
              $concat: [
                newPath,
                {
                  $substr: [
                    '$categoryPath',
                    oldPath.length,
                    { $strLenCP: '$categoryPath' },
                  ],
                },
              ],
            },
          },
        },
      ],
      { updatePipeline: true },
    );

    const escapedOldPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const productsToUpdate = await this.productModel.find({
      productPath: new RegExp(`^${escapedOldPath}`),
    });

    for (const product of productsToUpdate) {
      const updatedPaths = product.productPath.map((path) => {
        if (path.startsWith(oldPath)) {
          return newPath + path.substring(oldPath.length);
        }
        return path;
      });

      await this.productModel.updateOne(
        { _id: product._id },
        { $set: { productPath: updatedPaths } },
      );
    }
    await this.permissionsService.updatePermissionsOnMove(
      id,
      EntityType.CATEGORY,
      newParentPath,
    );

    return {
      success: true,
      message: `Subcategory moved successfully from ${oldPath} to ${newPath}`,
      category: await this.categoryModel.findById(id),
    };
  }

  async getCategoryById(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

private slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFKC') 
    .replace(/\s+/g, '-') 
    .replace(/[^\u0590-\u05FFa-z0-9-]/gi, '') 
    .replace(/-+/g, '-') 
    .replace(/^-|-$/g, ''); 
}


  private async buildAllowedMapForUser(user: {
    userId: string;
    role: string;
  }): Promise<{
    userGroupIds: string[];
    allowedByEntityId: Map<string, { users: Set<string>; groups: Set<string> }>;
  }> {
    const userGroups = await this.groupModel
      .find({ members: user.userId })
      .select('_id')
      .lean();

    const userGroupIds = userGroups.map((g) => g._id.toString());

    const permissions = await this.permissionsService.getPermissionsForUser(
      user.userId,
      userGroupIds,
    );

    const allowedByEntityId = new Map<
      string,
      { users: Set<string>; groups: Set<string> }
    >();

    for (const p of permissions) {
      if (p.entityType !== EntityType.CATEGORY) continue;

      const entityId = p.entityId.toString();
      const allowedId = p.allowed.toString();

      if (!allowedByEntityId.has(entityId)) {
        allowedByEntityId.set(entityId, {
          users: new Set(),
          groups: new Set(),
        });
      }

      const entry = allowedByEntityId.get(entityId)!;

      if (userGroupIds.includes(allowedId)) {
        entry.groups.add(allowedId);
      } else if (allowedId === user.userId) {
        entry.users.add(allowedId);
      }
    }

    return { userGroupIds, allowedByEntityId };
  }

  private hasCategoryPermission(
    categoryId: string,
    user: { userId: string; role: string },
    userGroupIds: string[],
    allowedByEntityId: Map<string, { users: Set<string>; groups: Set<string> }>,
  ): boolean {
    const entry = allowedByEntityId.get(categoryId);
    if (!entry) return false;

    if (userGroupIds.length > 0) {
      return userGroupIds.every((gid) => entry.groups.has(gid));
    }

    return entry.users.has(user.userId);
  }

  private getParentPath(fullCategoryPath: string): string {
    const idx = fullCategoryPath.lastIndexOf('/');
    return idx === -1 ? '' : fullCategoryPath.substring(0, idx);
  }

  async hasDescendants(
    categoryId: string,
  ): Promise<{ hasDescendants: boolean }> {
    const category = await this.categoryModel
      .findById(categoryId)
      .select('categoryPath')
      .lean();

    if (!category) throw new NotFoundException('Category not found');

    const categoryPath = category.categoryPath;
    const escaped = categoryPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const hasSubCategories = await this.categoryModel.exists({
      categoryPath: new RegExp(`^${escaped}/`),
    });

    const hasProducts = await this.productModel.exists({
      productPath: { $elemMatch: { $regex: new RegExp(`^${escaped}(/|$)`) } },
    });

    return { hasDescendants: !!(hasSubCategories || hasProducts) };
  }
}
