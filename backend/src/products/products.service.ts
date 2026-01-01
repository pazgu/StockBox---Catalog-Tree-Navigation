/* eslint-disable no-useless-catch */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/Products.schema';
import { CreateProductDto } from './dtos/CreateProduct.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }
  async findByPath(path: string): Promise<Product[]> {
    try {
      const allProducts = await this.productModel.find().exec();
      const filteredProducts = allProducts.filter((p) => {
        if (!p.productPath || !p.productPath.startsWith(path)) {
          return false;
        }
        const remainingPath = p.productPath.substring(path.length);
        const slashCount = (remainingPath.match(/\//g) || []).length;
        return slashCount <= 1;
      });
      return filteredProducts;
    } catch (error) {
      throw error;
    }
  }
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }
}
