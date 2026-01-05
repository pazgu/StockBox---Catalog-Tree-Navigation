import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/Products.schema';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import { uploadBufferToCloudinary } from 'src/utils/cloudinary/upload.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findByPath(path: string): Promise<Product[]> {
    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matchingProducts = await this.productModel
      .find({ productPath: new RegExp(`^${escapedPath}`) })
      .exec();

    const directChildren = matchingProducts.filter((product) => {
      if (!product.productPath || !product.productPath.startsWith(path))
        return false;
      const remainingPath = product.productPath.substring(path.length);
      const slashCount = (remainingPath.match(/\//g) || []).length;
      return slashCount <= 1;
    });

    return directChildren;
  }

  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    if (file?.buffer) {
      const uploaded = await uploadBufferToCloudinary(
        file.buffer,
        'stockbox/products',
      );
      createProductDto.productImage = uploaded.secure_url;
    }

    const newProduct = new this.productModel(createProductDto);
    return newProduct.save();
  }

}
