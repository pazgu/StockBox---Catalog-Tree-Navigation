/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { EntityType, Permission } from 'src/schemas/Permissions.schema';
import { Types } from 'mongoose';
import { CreatePermissionDto } from './dto/createPermission.dto';
import { ProductDocument } from 'src/schemas/Products.schema';
import { Category, CategoryDocument } from 'src/schemas/Categories.schema';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private usersService: UsersService,
  ) {}

  async getPermissionsForUser(allowedId: string) {
    return await this.permissionModel
      .find({ allowed: new Types.ObjectId(allowedId) })
      .exec();
  }

  async createPermission(dto: CreatePermissionDto) {
    return await this.permissionModel.create(dto);
  }

  async deletePermission(id: string) {
    const permission = await this.permissionModel.findById(id).exec();

    if (!permission) {
      return null;
    }
    const directChildren = await this.getDirectChildrenToDelete(
      permission.entityId.toString(),
    );
    if (directChildren.length > 0) {
      const childIds = directChildren.map((child) => child._id.toString());
      await this.permissionModel
        .deleteMany({
          entityId: { $in: childIds },
          entityType: EntityType.CATEGORY,
        })
        .exec();
    }
    return this.permissionModel.findByIdAndDelete(id).exec();
  }

  async getPermissionsByEntityType(entityId: string) {
    return await this.permissionModel.find({ entityId: entityId }).exec();
  }

  async getPermissionsForAllowedId(allowedId: string) {
    return await this.permissionModel
      .find({ allowed: new Types.ObjectId(allowedId) })
      .exec();
  }

  async getAllowedUsersForEntity(
    entityId: string,
    entityType: EntityType,
  ): Promise<string[]> {
    const allowedUsers = await this.permissionModel.aggregate([
      {
        $match: { entityId: new mongoose.Types.ObjectId(entityId), entityType },
      },
      { $group: { _id: '$allowed' } },
      { $project: { _id: 1 } },
    ]);
    return allowedUsers.map((u) => u._id.toString());
  }

  async assignPermissionsForNewEntity(
    entity: ProductDocument | CategoryDocument,
  ) {
    const isProduct = 'productPath' in entity;
    const path = isProduct ? entity.productPath : entity.categoryPath;

    const rawParts = path.split('/').filter(Boolean);
    const normalizedParts =
      rawParts[0] === 'categories' ? rawParts.slice(1) : rawParts;

    if (!isProduct && normalizedParts.length === 1) {
      const allUsers = await this.usersService.getAllUserIds();

      const permissions = allUsers.map((userId) => ({
        entityType: EntityType.CATEGORY,
        entityId: entity._id,
        allowed: userId,
      }));

      if (permissions.length) {
        await this.permissionModel.insertMany(permissions);
      }
      return;
    }

    const parentName = normalizedParts[normalizedParts.length - 2];
    if (!parentName) return;

    const parentPath = '/categories/' + normalizedParts.slice(0, -1).join('/');
    const parentCategory = await this.categoryModel
      .findOne({ categoryPath: parentPath })
      .select('_id')
      .lean();

    if (!parentCategory) return;

    const allowedUsers = await this.getAllowedUsersForEntity(
      parentCategory._id.toString(),
      EntityType.CATEGORY,
    );

    const permissions = allowedUsers.map((userId) => ({
      entityType: isProduct ? EntityType.PRODUCT : EntityType.CATEGORY,
      entityId: entity._id,
      allowed: userId,
    }));

    if (permissions.length) {
      await this.permissionModel.insertMany(permissions);
    }
  }

  async getDirectChildrenToDelete(categoryId: string) {
    if (!categoryId) return [];
    const category = await this.categoryModel.findById(categoryId);
    if (!category) return [];
    let cleanPath = category.categoryPath;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    const fullPath = cleanPath.startsWith('categories/')
      ? `/${cleanPath}`
      : `/categories/${cleanPath}`;

    const allChildren = await this.categoryModel.find({
      categoryPath: new RegExp(
        `^${fullPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`,
      ),
    });

    const directChildren = allChildren.filter((cat) => {
      const remainingPath = cat.categoryPath.substring(fullPath.length + 1);
      const slashCount = (remainingPath.match(/\//g) || []).length;
      return slashCount === 0;
    });

    return directChildren;
  }
}
