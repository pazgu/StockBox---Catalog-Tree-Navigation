/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
} from '@nestjs/common';
import {
  FileInterceptor as ProductFileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import { MoveProductDto } from './dtos/MoveProduct.dto';
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
    const fullPath = `/${pathPart}`;

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

  @ProductGet(':id')
  getProductById(@ProductParam('id') id: string) {
    return this.productsService.getById(id);
  }

  @ProductDelete(':id')
  @ProductUseGuards(JwtAuthGuard, EditorGuard)
  @HttpCode(HttpStatus.OK)
  delete(@ProductParam('id', ParseObjectIdPipe) id: string) {
    return this.productsService.delete(id);
  }

  // IMPORTANT: Move endpoint MUST come BEFORE the :id PATCH route
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

  @ProductPatch(':id')
  @ProductUseInterceptors(ProductFileInterceptor('newProductImages'))
  async updateProduct(
    @ProductParam('id') id: string,
    @ProductUploadedFile() files: Express.Multer.File[],
    @ProductBody() body: any,
  ) {
    console.log('raw body:', body);
    console.log('files:', files);

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
}
