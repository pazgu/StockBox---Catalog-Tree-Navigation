/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-useless-escape */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schemas/Categories.schema';
import { CreateCategoryDto } from './dtos/CreateCategory.dto';
import { Product } from 'src/schemas/Products.schema';
import { UpdateCategoryDto } from './dtos/UpdateCategory.dto';
import { uploadBufferToCloudinary } from 'src/utils/cloudinary/upload.util';
import { EntityType } from 'src/schemas/Permissions.schema';
import { PermissionsService } from 'src/permissions/permissions.service';
@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly permissionsService: PermissionsService,
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
    return newCategory.save();
  }

  async getCategories(user: { userId: string; role: string }) {
    const categories = await this.categoryModel.find({
      categoryPath: /^\/categories\/[^\/]+$/,
    });

    if (user.role === 'editor') {
      return categories;
    }

    if (user.role === 'viewer') {
      const permissions = await this.permissionsService.getPermissionsForUser(
        user.userId,
      );
      const allowedCategoryIds = permissions

        .filter((p) => p.allowed.toString() === user.userId)
        .map((p) => p.entityId.toString());

      const visibleCategories = categories.filter((cat) =>
        allowedCategoryIds.includes(cat._id.toString()),
      );

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
      const permissions = await this.permissionsService.getPermissionsForUser(
        user.userId,
      );
      const userPermissions = permissions.filter(
        (p) =>
          p.entityType === EntityType.CATEGORY &&
          p.allowed?.toString() === user.userId,
      );

      const allowedCategoryIds = userPermissions.map((p) =>
        p.entityId.toString(),
      );

      const visibleCategories = directChildren.filter((cat) =>
        allowedCategoryIds.includes(cat._id.toString()),
      );

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
      categoryPath: new RegExp(`^${categoryPath}`),
    });

    await this.categoryModel.findByIdAndDelete(id);

    return {
      success: true,
      message: 'Category and all nested content deleted successfully',
      deletedCategoryPath: categoryPath,
    };
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    const oldCategoryPath = category.categoryPath;

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
      );

      await this.productModel.updateMany(
        { categoryPath: new RegExp(`^${oldCategoryPath}`) },
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
      );
    }

    return updatedCategory;
  }
  async getCategoryById(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
