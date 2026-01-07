import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from 'src/schemas/Permissions.schema';
import { Types } from 'mongoose';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async getAllPermissions(allowedId: string) {
    return await this.permissionModel
      .find({ allowed: new Types.ObjectId(allowedId) })
      .exec();
  }
  async createPermission(createPermissionDto: any) {
    const newPermission = new this.permissionModel(createPermissionDto);
    return newPermission.save();
  }
  async deletePermission(id: string) {
    return this.permissionModel.findByIdAndDelete(id).exec();
  }
}
