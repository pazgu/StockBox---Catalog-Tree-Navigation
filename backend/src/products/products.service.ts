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
      const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchingProducts = await this.productModel
        .find({
          productPath: new RegExp(`^${escapedPath}`),
        })
        .exec();
      const directChildren = matchingProducts.filter((product) => {
        if (!product.productPath || !product.productPath.startsWith(path)) {
          return false;
        }
        const remainingPath = product.productPath.substring(path.length);
        const slashCount = (remainingPath.match(/\//g) || []).length;
        return slashCount <= 1;
      });
      return directChildren;
    } catch (error) {
      throw error;
    }
  }
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    return createdProduct.save();
  }
}
