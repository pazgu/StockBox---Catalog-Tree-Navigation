/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
  Param,
  Patch,
  Req,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/CreateCategory.dto';
import { UpdateCategoryDto } from './dtos/UpdateCategory.dto';
import { MoveCategoryDto } from './dtos/MoveCategory.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { categoryUploadsOptions } from './categoryUploads';
import { PermissionGuard } from 'src/gaurds/permission.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('categories')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Req() req) {
    return await this.categoriesService.getCategories(req.user);
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

  @Get('children/*path')
  async getDirectChildren(@Req() request: any) {
    const fullUrl = request.url;
    const pathPart = fullUrl.split('children/')[1];

    if (!pathPart) {
      return [];
    }

    const decodedPath = decodeURIComponent(pathPart);

    return await this.categoriesService.getDirectChildren(
      decodedPath,
      request.user,
    );
  }

  @Patch(':id/move')
  @UsePipes(new ValidationPipe({ transform: true }))
  async moveCategory(
    @Param('id') id: string,
    @Body() moveCategoryDto: MoveCategoryDto,
  ) {
    return await this.categoriesService.moveCategory(id, moveCategoryDto);
  }

  @Get('by-path/*path')
  async getCategoryByPath(@Req() request: any) {
    const fullUrl = request.url;
    const pathPart = fullUrl.split('by-path/')[1];

    if (!pathPart) {
      throw new NotFoundException('Path not provided');
    }

    const decodedPath = decodeURIComponent(pathPart);

    return await this.categoriesService.getCategoryByPath(
      decodedPath,
      request.user,
    );
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('categoryImageFile', categoryUploadsOptions))
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto & { categoryImage?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const categoryImage =
      updateCategoryDto.categoryImage &&
      typeof updateCategoryDto.categoryImage === 'string'
        ? JSON.parse(updateCategoryDto.categoryImage)
        : updateCategoryDto.categoryImage;

    const finalDto = { ...updateCategoryDto, categoryImage };
    return await this.categoriesService.updateCategory(id, finalDto, file);
  }
  @Get(':id/has-descendants')
  async hasDescendants(@Param('id') id: string) {
    return this.categoriesService.hasDescendants(id);
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return this.categoriesService.getCategoryById(id);
  }
}
