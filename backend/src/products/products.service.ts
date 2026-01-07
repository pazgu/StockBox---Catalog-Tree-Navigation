/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../schemas/Products.schema';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import { uploadBufferToCloudinary } from 'src/utils/cloudinary/upload.util';
import { PermissionsService } from 'src/permissions/permissions.service';
import { EntityType } from 'src/schemas/Permissions.schema';
import { Category } from 'src/schemas/Categories.schema';
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private category: Model<Category>,
    private permissionsService: PermissionsService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findByPath(
    path: string,
    user?: { userId: string; role: string }, // accept user
  ): Promise<Product[]> {
    if (!user) {
      return [];
    }
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

    if (user.role === 'editor') {
      return directChildren;
    }

    if (user.role === 'viewer') {
      const permissions = await this.permissionsService.getAllPermissions();

      const allowedProductIds = permissions
        .filter(
          (p) =>
            p.entityType === EntityType.PRODUCT &&
            p.allowed?.equals(user.userId),
        )
        .map((p) => p.entityId.toString());

      const visibleProducts = directChildren.filter((p) =>
        allowedProductIds.includes(p._id.toString()),
      );

      return visibleProducts;
    }

    return [];
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
