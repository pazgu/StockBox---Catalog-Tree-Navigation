/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller as ProductController,
  Get as ProductGet,
  Post as ProductPost,
  Delete as ProductDelete,
  Body as ProductBody,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors as ProductUseInterceptors,
  UploadedFile as ProductUploadedFile,
  UsePipes as ProductUsePipes,
  ValidationPipe as ProductValidationPipe,
  Param as ProductParam,
  UseGuards as ProductUseGuards,
  Patch as ProductPatch,
  UploadedFiles,
  Query as ProductQuery,
} from '@nestjs/common';
import {
  FilesInterceptor,
  FileInterceptor as ProductFileInterceptor,
} from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import { MoveProductDto } from './dtos/MoveProduct.dto';
import { DuplicateProductDto } from './dtos/DuplicateProduct.dto';
import express from 'express';
import { productUploadsOptions } from './productUploads';
import { JwtAuthGuard } from 'src/gaurds/jwt-auth.guard';
import { EditorGuard } from 'src/gaurds/editor.guard';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';
import { UpdateProductDto } from './dtos/UpdateProduct.dto';
import { AuthGuard as ProductAuthGuard } from '@nestjs/passport';
import { PermissionGuard as ProductPermissionGuard } from 'src/gaurds/permission.guard';

@ProductController('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ProductGet()
  findAll() {
    return this.productsService.findAll();
  }
  @ProductUseGuards(ProductAuthGuard('jwt'), ProductPermissionGuard)
  @ProductGet('by-path/*')
  findByPath(
    @Req()
    request: express.Request & { user?: { userId: string; role: string } },
  ) {
    const fullUrl = request.url;
    const pathPart = fullUrl.split('by-path/')[1];
    const decodedPath = decodeURIComponent(pathPart);
    const fullPath = `/${decodedPath}`;

    if (!request.user) {
      return [];
    }

    const user = { userId: request.user.userId, role: request.user.role };

    return this.productsService.findByPath(fullPath, user);
  }
  @ProductPost()
  @ProductUseGuards(JwtAuthGuard, EditorGuard)
  @HttpCode(HttpStatus.CREATED)
  @ProductUsePipes(new ProductValidationPipe({ transform: true }))
  @ProductUseInterceptors(
    ProductFileInterceptor('productImageFile', productUploadsOptions),
  )
  create(
    @ProductBody() createProductDto: CreateProductDto,
    @ProductUploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, file);
  }

  @ProductDelete(':id')
  @ProductUseGuards(JwtAuthGuard, EditorGuard)
  @HttpCode(HttpStatus.OK)
  delete(
    @ProductParam('id', ParseObjectIdPipe) id: string,
    @ProductQuery('categoryPath') categoryPath?: string,
  ) {
    return this.productsService.delete(id, categoryPath);
  }

  @ProductPost(':id/move')
  @ProductUseGuards(JwtAuthGuard, EditorGuard)
  @HttpCode(HttpStatus.OK)
  @ProductUsePipes(new ProductValidationPipe({ transform: true }))
  async moveProduct(
    @ProductParam('id') id: string,
    @ProductBody() moveProductDto: MoveProductDto,
  ) {
    return this.productsService.moveProduct(id, moveProductDto);
  }

  @ProductPost(':id/duplicate')
  @ProductUseGuards(JwtAuthGuard, EditorGuard)
  @HttpCode(HttpStatus.OK)
  @ProductUsePipes(new ProductValidationPipe({ transform: true }))
  async duplicateProduct(
    @ProductParam('id') id: string,
    @ProductBody() duplicateProductDto: DuplicateProductDto,
  ) {
    return this.productsService.duplicateProduct(id, duplicateProductDto);
  }

  @ProductPatch(':id')
  @ProductUseInterceptors(
    FilesInterceptor('newProductImages', 20, productUploadsOptions),
  )
  async updateProduct(
    @ProductParam('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @ProductBody() body: any,
  ) {
    const existingImages: string[] = body.existingProductImages
      ? JSON.parse(body.existingProductImages)
      : [];

    const dto: UpdateProductDto = {
      productName: body.productName,
      productDescription: body.productDescription,
      productPath: body.productPath,
      customFields: body.customFields
        ? JSON.parse(body.customFields)
        : undefined,
      productImages: existingImages,
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

  @ProductUseGuards(ProductAuthGuard('jwt'), ProductPermissionGuard)
  @ProductGet(':id')
  getProductById(
    @Req()
    request: express.Request & { user?: { userId: string; role: string } },
    @ProductParam('id', ParseObjectIdPipe) id: string,
  ) {
    return this.productsService.getById(id, request.user);
  }

  @ProductDelete(':id/paths')
  @ProductUseGuards(JwtAuthGuard, EditorGuard)
  @HttpCode(HttpStatus.OK)
  async deleteFromSpecificPaths(
    @ProductParam('id', ParseObjectIdPipe) id: string,
    @ProductBody() body: { paths: string[] },
  ) {
    return this.productsService.deleteFromSpecificPaths(id, body.paths);
  }
}
