import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from 'src/schemas/Permissions.schema';
@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  getAllPermissions() {
    return this.permissionModel.find().exec();
  }
  async createPermission(createPermissionDto: any) {
    const newPermission = new this.permissionModel(createPermissionDto);
    return newPermission.save();
  }
  async deletePermission(id: string) {
    return this.permissionModel.findByIdAndDelete(id).exec();
  }
}
