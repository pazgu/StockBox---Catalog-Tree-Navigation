/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { Types } from 'mongoose';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('User context missing');
    }
    if (user?.role === UserRole.EDITOR) {
      return true;
    }

    const entityId = request.params.id;
    if (!entityId) return true;

    const isProductRoute = request.url.includes('products');
    const entityType = isProductRoute
      ? EntityType.PRODUCT
      : EntityType.CATEGORY;

    const hasPermission = await this.permissionModel.findOne({
      entityId: new Types.ObjectId(entityId),
      allowed: new Types.ObjectId(user.userId),
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
