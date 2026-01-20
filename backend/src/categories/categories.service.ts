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

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Group.name) private groupModel: Model<Category>,
    private readonly permissionsService: PermissionsService,
    private readonly usersService: UsersService,
  ) {}

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

    const newCategory = new this.categoryModel(createCategoryDto);
    const savedCategory = await newCategory.save();

    await this.permissionsService.assignPermissionsForNewEntity(savedCategory);

    return savedCategory;
  }

  async getCategories(user: { userId: string; role: string }) {
    const categories = await this.categoryModel.find({
      categoryPath: /^\/categories\/[^\/]+$/,
    });

    if (user.role === 'editor') {
      return categories;
    }

    if (user.role === 'viewer') {
      const userGroups = await this.groupModel
        .find({ members: user.userId })
        .select('_id')
        .lean();
      const userGroupIds = userGroups.map((g) => g._id.toString());
      const permissions = await this.permissionsService.getPermissionsForUser(
        user.userId,
        userGroupIds,
      );
      const visibleCategories = categories.filter((cat) => {
        const categoryId = cat._id.toString();
        const anyGroupBlocks = userGroupIds.some((groupId) => {
          return !permissions.some(
            (p) =>
              p.entityId.toString() === categoryId &&
              p.allowed.toString() === groupId,
          );
        });
        if (anyGroupBlocks) {
          return false;
        }
        return true;
      });

      return visibleCategories;
    }

    return [];
  }

  async getDirectChildren(
    categoryPath: string,
    user: { userId: string; role: string },
  ) {
    if (!categoryPath) {
      return [];
    }

    let cleanPath = categoryPath;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }

    const fullPath = `/categories/${cleanPath}`;

    const allChildren = await this.categoryModel.find({
      categoryPath: new RegExp(
        `^${fullPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`,
      ),
    });

    const directChildren = allChildren.filter((cat) => {
      const remainingPath = cat.categoryPath.substring(fullPath.length + 1);
      const slashCount = (remainingPath.match(/\//g) || []).length;
      return slashCount === 0;
    });

    if (user.role === 'editor') {
      return directChildren;
    }
    if (user.role === 'viewer') {
      const userGroups = await this.groupModel
        .find({ members: user.userId })
        .select('_id')
        .lean();
      const userGroupIds = userGroups.map((g) => g._id.toString());
      const permissions = await this.permissionsService.getPermissionsForUser(
        user.userId,
        userGroupIds,
      );
      const visibleCategories = directChildren.filter((cat) => {
        const categoryId = cat._id.toString();
        const anyGroupBlocks = userGroupIds.some((groupId) => {
          return !permissions.some(
            (p) =>
              p.entityId.toString() === categoryId &&
              p.entityType === EntityType.CATEGORY &&
              p.allowed.toString() === groupId,
          );
        });
        return !anyGroupBlocks;
      });
      return visibleCategories;
    }

    return [];
  }
  async deleteCategory(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const categoryPath = category.categoryPath;

    await this.categoryModel.deleteMany({
      categoryPath: new RegExp(`^${categoryPath}/`),
    });

    await this.productModel.deleteMany({
      productPath: new RegExp(`^${categoryPath}`),
    });

    await this.categoryModel.findByIdAndDelete(id);

    return {
      success: true,
      message: 'Category and all nested content deleted successfully',
      deletedCategoryPath: categoryPath,
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

    if (
      updateCategoryDto.categoryName &&
      updateCategoryDto.categoryName !== category.categoryName
    ) {
      const parentPath = this.getParentPath(oldCategoryPath);
      const newSlug = this.slugify(updateCategoryDto.categoryName);
      const newCategoryPath = `${parentPath}/${newSlug}`;

      const dup = await this.categoryModel.findOne({
        categoryPath: newCategoryPath,
        _id: { $ne: id },
      });

      if (dup) {
        throw new BadRequestException(
          'A category with this name already exists in this location',
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

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      { new: true },
    );

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

      await this.productModel.updateMany(
        { productPath: new RegExp(`^${oldCategoryPath}`) },
        [
          {
            $set: {
              productPath: {
                $concat: [
                  newCategoryPath,
                  {
                    $substr: [
                      '$productPath',
                      oldCategoryPath.length,
                      { $strLenCP: '$productPath' },
                    ],
                  },
                ],
              },
            },
          },
        ],
        { updatePipeline: true },
      );
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
      throw new BadRequestException(
        'A category with this name already exists at the destination',
      );
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

    await this.productModel.updateMany(
      {
        productPath: new RegExp(
          `^${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        ),
      },
      [
        {
          $set: {
            productPath: {
              $concat: [
                newPath,
                {
                  $substr: [
                    '$productPath',
                    oldPath.length,
                    { $strLenCP: '$productPath' },
                  ],
                },
              ],
            },
          },
        },
      ],
      { updatePipeline: true },
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
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private getParentPath(fullCategoryPath: string): string {
    const idx = fullCategoryPath.lastIndexOf('/');
    return idx === -1 ? '' : fullCategoryPath.substring(0, idx);
  }
}
