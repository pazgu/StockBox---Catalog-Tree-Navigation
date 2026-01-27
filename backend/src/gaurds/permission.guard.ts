/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group } from 'src/schemas/Groups.schema';
import { Permission, EntityType } from 'src/schemas/Permissions.schema';
import { UserRole } from 'src/schemas/Users.schema';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,

    @InjectModel(Group.name)
    private readonly groupModel: Model<Group>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.userId) {
      throw new ForbiddenException('User context missing');
    }

    if (user.role === UserRole.EDITOR) {
      return true;
    }

    const entityId = request.params.id;
    if (!entityId) return true;

    const entityType = request.url.includes('products')
      ? EntityType.PRODUCT
      : EntityType.CATEGORY;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const entityObjectId = new Types.ObjectId(entityId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const userObjectId = new Types.ObjectId(user.userId);

    /**
     * 1️⃣ Find all groups the user belongs to
     */
    const userGroups = await this.groupModel
      .find({ members: { $in: [userObjectId.toString()] } })
      .select('_id')
      .lean();

    /**
     * 2️⃣ CASE: User is NOT in any group
     * → check user permission only
     */
    if (userGroups.length === 0) {
      const userPermission = await this.permissionModel.findOne({
        entityId: entityObjectId,
        allowed: userObjectId,
        entityType,
      });

      if (!userPermission) {
        throw new ForbiddenException(
          'You do not have permission to access this item',
        );
      }

      return true;
    }

    /**
     * 3️⃣ CASE: User IS in one or more groups
     * → ALL groups must have permission
     */
    const groupIds = userGroups.map((g) => g._id);

    const groupPermissions = await this.permissionModel
      .find({
        entityId: entityObjectId,
        allowed: { $in: groupIds },
        entityType,
      })
      .select('allowed')
      .lean();

    const allowedGroupIds = new Set(
      groupPermissions.map((p) => p.allowed.toString()),
    );

    const allGroupsAllowed = groupIds.every((groupId) =>
      allowedGroupIds.has(groupId.toString()),
    );

    if (!allGroupsAllowed) {
      throw new ForbiddenException(
        'One or more of your groups does not have permission to access this item',
      );
    }

    return true;
  }
}
