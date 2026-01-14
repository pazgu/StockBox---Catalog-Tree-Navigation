/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from '../schemas/Products.schema';
import { CreateProductDto } from './dtos/CreateProduct.dto';
import { MoveProductDto } from './dtos/MoveProduct.dto';
import { uploadBufferToCloudinary } from 'src/utils/cloudinary/upload.util';
import { deleteFromCloudinary } from 'src/utils/cloudinary/delete.util';
import { PermissionsService } from 'src/permissions/permissions.service';
import { EntityType } from 'src/schemas/Permissions.schema';
import { UpdateProductDto } from './dtos/UpdateProduct.dto';
import { Category } from 'src/schemas/Categories.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private permissionsService: PermissionsService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async getById(id: string) {
    const product = await this.productModel.findById(id).lean();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByPath(
    path: string,
    user?: { userId: string; role: string },
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
      const permissions = await this.permissionsService.getPermissionsForUser(
        user.userId,
      );

      const allowedProductIds = permissions
        .filter(
          (p) =>
            p.entityType === EntityType.PRODUCT &&
            p.allowed.toString() === user.userId,
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

      createProductDto.productImages = [uploaded.secure_url];
    }

    if (!createProductDto.productImages) {
      createProductDto.productImages = [];
    }

    const newProduct = new this.productModel(createProductDto);
    const saved = await newProduct.save();

    return saved;
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    try {
      if (product.productImages && product.productImages.length > 0) {
        await Promise.all(
          product.productImages.map((url) => this.deleteProductImage(url)),
        );
      }

      await this.productModel.findByIdAndDelete(id);

      return {
        success: true,
        message: `Product "${product.productName}" deleted successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete product: ${(error as Error).message}`,
      );
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    console.log('the dto:', dto);

    if (dto.customFields && Array.isArray(dto.customFields)) {
      dto.customFields = dto.customFields.map((field) => {
        if (field._id?.startsWith('new-')) {
          return {
            ...field,
            _id: new Types.ObjectId().toString(),
          };
        }
        return field;
      });
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true },
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return updatedProduct;
  }

  async moveProduct(id: string, moveProductDto: MoveProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { newCategoryPath } = moveProductDto;

    const categoryExists = await this.categoryModel.findOne({
      categoryPath: newCategoryPath,
    });

    if (!categoryExists) {
      throw new BadRequestException('Target category does not exist');
    }

    const oldPath = product.productPath;
    const productName = product.productName.toLowerCase().replace(/\s+/g, '-');
    const newPath = `${newCategoryPath}/${productName}`;

    const existingProduct = await this.productModel.findOne({
      productPath: newPath,
      _id: { $ne: id },
    });

    if (existingProduct) {
      throw new BadRequestException(
        'A product with this name already exists at the destination',
      );
    }

    product.productPath = newPath;
    await product.save();

    return {
      success: true,
      message: `Product moved successfully from ${oldPath} to ${newPath}`,
      product: await this.productModel.findById(id),
    };
  }

  private async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      const publicId = this.extractCloudinaryPublicId(imageUrl);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    } catch (error) {
      console.error(
        `Failed to delete image from Cloudinary: ${(error as Error).message}`,
      );
    }
  }

  private extractCloudinaryPublicId(url: string): string | null {
    try {
      const matches = url.match(/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  }
}
