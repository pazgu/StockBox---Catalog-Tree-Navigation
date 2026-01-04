/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Delete,
  Param,
  Patch,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/CreateCategory.dto';
import { UpdateCategoryDto } from './dtos/UpdateCategory.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { categoryUploadsOptions } from './categoryUploads';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return await this.categoriesService.getCategories();
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('categoryImageFile', categoryUploadsOptions))
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.categoriesService.createCategory(createCategoryDto, file);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return await this.categoriesService.deleteCategory(id);
  }

  @Get('children/*path')
  async getDirectChildren(@Req() request: any) {
    const fullUrl = request.url;
    const pathPart = fullUrl.split('children/')[1];
    if (!pathPart) {
      return [];
    }
    return await this.categoriesService.getDirectChildren(pathPart);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('categoryImageFile', categoryUploadsOptions))
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.categoriesService.updateCategory(
      id,
      updateCategoryDto,
      file,
    );
  }
}
