/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, EntityType } from 'src/schemas/Permissions.schema';
import { UserRole } from 'src/schemas/Users.schema';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role === UserRole.EDITOR) {
      return true;
    }

    const entityId = request.params.id;

    if (!entityId) {
      return true;
    }

    const entityType = EntityType.CATEGORY;

    const hasPermission = await this.permissionModel.findOne({
      entityId: entityId,
      allowed: user.userId,
      entityType: entityType,
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to access this item',
      );
    }

    return true;
  }
}
