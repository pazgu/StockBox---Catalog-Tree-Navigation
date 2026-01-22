/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { Group } from 'src/schemas/Groups.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Group.name) private groupModel: Model<Category>,
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
      const currentPath = product.productPath.find((p) => p.startsWith(path));
      if (!currentPath) return false;

      const remainingPath = currentPath.substring(path.length);
      const slashCount = (remainingPath.match(/\//g) || []).length;
      return slashCount <= 1;
    });

    if (user.role === 'editor') {
      return directChildren;
    }

    if (user.role === 'viewer') {
      const userGroups = await this.groupModel
        .find({ members: user.userId })
        .select('_id')
        .lean();
      const userGroupIds = userGroups.map((g) => g._id.toString());

      const permissions = await this.permissionsService.getPermissionsForUser(
        user.userId,
        userGroupIds,
      );

      const visibleProducts = directChildren.filter((product) => {
        const productId = product._id.toString();

        if (userGroupIds.length > 0) {
          const allGroupsHavePermission = userGroupIds.every((groupId) =>
            permissions.some(
              (p) =>
                p.entityId.toString() === productId &&
                p.entityType === EntityType.PRODUCT &&
                p.allowed.toString() === groupId,
            ),
          );

          if (!allGroupsHavePermission) {
            console.log(
              `Not all groups have permission for product: ${product.productName}`,
            );
            return false;
          }
        } else {
          const hasUserPermission = permissions.some(
            (p) =>
              p.entityId.toString() === productId &&
              p.entityType === EntityType.PRODUCT &&
              p.allowed.toString() === user.userId,
          );

          if (!hasUserPermission) {
            console.log(
              `No personal permission for product: ${product.productName}`,
            );
            return false;
          }
        }

        return true;
      });

      return visibleProducts;
    }

    return [];
  }
  async create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    let productImages: string[] = [];
    if (file?.buffer) {
      try {
        const uploaded = await uploadBufferToCloudinary(
          file.buffer,
          'stockbox/products',
        );
        productImages = [uploaded.secure_url];
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
      }
    }

    let cleanCustomFields: any[] = [];

    if (createProductDto.customFields) {
      try {
        const parsed =
          typeof createProductDto.customFields === 'string'
            ? JSON.parse(createProductDto.customFields)
            : createProductDto.customFields;
        if (Array.isArray(parsed)) {
          cleanCustomFields = parsed.filter((f) => f && f.title && f.type);
        }
      } catch (error) {
        console.warn('Failed to parse customFields, defaulting to empty array');
        cleanCustomFields = [];
      }
    }

    const newProductData = {
      productName: createProductDto.productName,
      productDescription: createProductDto.productDescription || '',
      productPath: [createProductDto.productPath],
      productImages: productImages,
      customFields: cleanCustomFields,
    };

    try {
      const newProduct = new this.productModel(newProductData);
      const savedProduct = await newProduct.save();

      await this.permissionsService.assignPermissionsForNewEntity(savedProduct);

      return savedProduct;
    } catch (error) {
      console.error('Mongoose Save Error:', error);
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation Failed: ${error.message}`);
      }
      throw new InternalServerErrorException(
        'Failed to create product in database',
      );
    }
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
    const existing = await this.productModel.findById(id);
    if (!existing) throw new NotFoundException('Product not found');

    if (dto.customFields && Array.isArray(dto.customFields)) {
      dto.customFields = dto.customFields.map((field) => {
        if (field._id?.startsWith('new-')) {
          return { ...field, _id: new Types.ObjectId().toString() };
        }
        return field;
      });
    }

    if (dto.productName && dto.productName !== existing.productName) {
      const parentPath = this.getParentPath(existing.productPath[0]);
      const newSlug = this.slugify(dto.productName);
      const newPath = `${parentPath}/${newSlug}`;

      const dup = await this.productModel.findOne({
        productPath: newPath,
        _id: { $ne: id },
      });

      if (dup) {
        throw new BadRequestException(
          'A product with this name already exists in this category',
        );
      }

      dto.productPath = [newPath];
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

    for (const path of newCategoryPath) {
      const categoryExists = await this.categoryModel.findOne({
        categoryPath: path,
      });

      if (!categoryExists) {
        throw new BadRequestException(`Category path does not exist: ${path}`);
      }
    }

    const productName = product.productName.toLowerCase().replace(/\s+/g, '-');
    const newPaths = newCategoryPath.map(
      (catPath) => `${catPath}/${productName}`,
    );

    for (const newPath of newPaths) {
      const existingProduct = await this.productModel.findOne({
        productPath: newPath,
        _id: { $ne: id },
      });

      if (existingProduct) {
        throw new BadRequestException(
          `A product with this name already exists at: ${newPath}`,
        );
      }
    }

    product.productPath = newPaths;
    await product.save();

    return {
      success: true,
      message: `Product moved successfully to ${newPaths.length} ${newPaths.length === 1 ? 'category' : 'categories'}`,
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

  private slugify(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private getParentPath(fullProductPath: string): string {
    const idx = fullProductPath.lastIndexOf('/');
    return idx === -1 ? '' : fullProductPath.substring(0, idx);
  }
}
