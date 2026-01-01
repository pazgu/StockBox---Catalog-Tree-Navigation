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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/CreateCategory.dto';
import { UpdateCategoryDto } from './dtos/UpdateCategory.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll() {
    return await this.categoriesService.getCategories();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.createCategory(createCategoryDto);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return await this.categoriesService.deleteCategory(id);
  }

  @Get('children/*')
  async getDirectChildren(@Req() request: any) {
    const fullUrl = request.url;
    const pathPart = fullUrl.split('children/')[1];
    if (!pathPart) {
      return [];
    }
    return await this.categoriesService.getDirectChildren(pathPart);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.updateCategory(id, updateCategoryDto);
  }
}
