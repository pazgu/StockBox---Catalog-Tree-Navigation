/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import express from 'express';
import { productUploadsOptions } from './productUploads';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('by-path/*')
  findByPath(@Req() request: express.Request) {
    const fullUrl = request.url;
    const pathPart = fullUrl.split('by-path/')[1];
    const fullPath = `/${pathPart}`;
    return this.productsService.findByPath(fullPath);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @UseInterceptors(FileInterceptor('productImageFile', productUploadsOptions))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, file);
  }
}
