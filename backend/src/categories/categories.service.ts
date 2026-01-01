import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schemas/Categories.schema';
import { CreateCategoryDto } from './dtos/CreateCategory.dto';
import { Product } from 'src/schemas/Products.schema';
import { UpdateCategoryDto } from './dtos/UpdateCategory.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const newCategory = new this.categoryModel(createCategoryDto);
    return newCategory.save();
  }

  async getCategories() {
    const categories = await this.categoryModel.find({
      categoryPath: /^\/categories\/[^\/]+$/,
    });
    return categories;
  }

  async getSubCategories(parentCategory: string) {
    const regex = new RegExp(`^/categories/${parentCategory}/[^/]+$`);
    const subCategories = await this.categoryModel.find({
      categoryPath: regex,
    });
    return subCategories;
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

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Find the category by ID
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const oldCategoryPath = category.categoryPath;
    const oldCategoryName = category.categoryName;

    // Update the category
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateCategoryDto,
      { new: true }, // Return the updated document
    );

    // If categoryPath or categoryName changed, update all nested categories and products
    if (
      updateCategoryDto.categoryPath &&
      updateCategoryDto.categoryPath !== oldCategoryPath
    ) {
      const newCategoryPath = updateCategoryDto.categoryPath;

      // Update nested categories
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

      // Update products in this category and nested categories
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
}
