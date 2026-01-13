/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ValidationPipe,
  Param,
  UseGuards,
  Patch,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import express from 'express';
import { productUploadsOptions } from './productUploads';
import { JwtAuthGuard } from 'src/gaurds/jwt-auth.guard';
import { EditorGuard } from 'src/gaurds/editor.guard';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { UpdateProductDto } from './dtos/UpdateProduct.dto';

import { AuthGuard } from '@nestjs/passport';
import { PermissionGuard } from 'src/gaurds/permission.guard';
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Get('by-path/*')
  findByPath(
    @Req()
    request: express.Request & { user?: { userId: string; role: string } },
  ) {
    const fullUrl = request.url;
    const pathPart = fullUrl.split('by-path/')[1];
    const fullPath = `/${pathPart}`;

    if (!request.user) {
      return [];
    }

    const user = { userId: request.user.userId, role: request.user.role };

    return this.productsService.findByPath(fullPath, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, EditorGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(FileInterceptor('productImageFile', productUploadsOptions))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, file);
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productsService.getById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, EditorGuard)
  @HttpCode(HttpStatus.OK)
  delete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.delete(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('newProductImages'))
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('newProductImages'))
  async updateProduct(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Body() body: any,
  ) {
    const dto: UpdateProductDto = {
      productName: body.productName,
      productDescription: body.productDescription,
      productPath: body.productPath,
      customFields: body.customFields
        ? JSON.parse(body.customFields)
        : undefined,
      productImages: body.existingProductImages
        ? [].concat(body.existingProductImages)
        : undefined,

      uploadFolders: body.uploadFolders
        ? [].concat(body.uploadFolders).map((group: any) => ({
            title: group.title,
            folders: group.folders.map((folder: any) => ({
              _id: folder._id,
              folderName: folder.folderName,
              files: folder.files.map((f: any) => ({
                _id: f._id,
                link: f.link,
              })),
            })),
          }))
        : undefined,
    };

    return this.productsService.update(id, dto);
  }
    return this.productsService.update(id, dto);
  }
}
