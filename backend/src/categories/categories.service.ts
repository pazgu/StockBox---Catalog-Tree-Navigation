import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from 'src/schemas/Categories.schema';
import { CreateCategoryDto } from './dtos/CreateCategory.dto';

@Injectable()
export class CategoriesService {
constructor(
   @InjectModel(Category.name) private categoryModel: Model<Category>,
 ) {}

 async createCategory(createCategoryDto: CreateCategoryDto) {
   const newCategory = new this.categoryModel(createCategoryDto);
   return newCategory.save();
 }

 async getCategories() {
   const categories = await this.categoryModel
     .find({
      categoryPath: /^\/categories\/[^\/]+$/,
     });
  return categories;
 }
}