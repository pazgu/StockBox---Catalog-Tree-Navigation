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
    return this.permissionModel.findByIdAndDelete(id).exec();
  }

  async getPermissionsByEntityType(entityId: string) {
    return await this.permissionModel.find({ entityId: entityId }).exec();
  }

  async getAllowedUsersForEntity(
    entityId: string,
    entityType: EntityType
  ): Promise<string[]> {
    const allowedUsers = await this.permissionModel.aggregate([
      { $match: { entityId: new mongoose.Types.ObjectId(entityId), entityType } },
      { $group: { _id: '$allowed' } }, 
      { $project: { _id: 1 } },
    ]);
    console.log('Allowed users for entity:', allowedUsers);
    return allowedUsers.map(u => u._id.toString());
  }



async assignPermissionsForNewEntity(
  entity: ProductDocument | CategoryDocument
) {
  const isProduct = 'productPath' in entity;
  const path = isProduct ? entity.productPath : entity.categoryPath;

  const rawParts = path.split('/').filter(Boolean);
  const normalizedParts = rawParts[0] === 'categories' ? rawParts.slice(1) : rawParts;
  console.log('Normalized path parts:', normalizedParts);

  if (!isProduct && normalizedParts.length === 1) {
    const allUsers = await this.usersService.getAllUserIds();
   
    const permissions = allUsers.map(userId => ({
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

  console.log('Parent category found:', parentCategory);

  const allowedUsers = await this.getAllowedUsersForEntity(
    parentCategory._id.toString(),
    EntityType.CATEGORY
  );


  const permissions = allowedUsers.map(userId => ({
    entityType: isProduct ? EntityType.PRODUCT : EntityType.CATEGORY,
    entityId: entity._id,
    allowed: userId,
  }));


  if (permissions.length) {
    await this.permissionModel.insertMany(permissions);
  }
}




}
