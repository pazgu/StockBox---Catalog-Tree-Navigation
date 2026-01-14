/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from 'src/schemas/Permissions.schema';
import { Types } from 'mongoose';
import { CreatePermissionDto } from './dto/createPermission.dto';
import { GroupsService } from 'src/groups/groups.service';
@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    private groupsService: GroupsService,
  ) {}

  async getPermissionsForUser(allowedId: string) {
    return await this.permissionModel
      .find({ allowed: new Types.ObjectId(allowedId) })
      .exec();
  }

  async createPermission(dto: CreatePermissionDto) {
    const mainPermission = await this.permissionModel.create(dto);
    try {
      const group = await this.groupsService.findById(dto.allowed);
      if (group) {
        const memberPermissions = group.members.map((m) => ({
          entityType: dto.entityType,
          entityId: dto.entityId,
          allowed: m.toString(),
          fromGroupId: dto.allowed,
        }));
        await this.permissionModel.insertMany(memberPermissions);
      }
    } catch (e) {
      return await this.permissionModel.create(dto);
    }

    return mainPermission;
  }
  async deletePermission(id: string) {
    return this.permissionModel.findByIdAndDelete(id).exec();
  }

  async getPermissionsByEntityType(entityId: string) {
    return await this.permissionModel.find({ entityId: entityId }).exec();
  }
}
