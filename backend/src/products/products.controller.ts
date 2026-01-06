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
  Param,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import express from 'express';
import { productUploadsOptions } from './productUploads';
import { JwtAuthGuard } from 'src/gaurds/jwt-auth.guard';
import { EditorGuard } from 'src/gaurds/editor.guard';
import { ParseObjectIdPipe } from 'src/pipes/parse-object-id.pipe';

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
}
