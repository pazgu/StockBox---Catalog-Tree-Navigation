import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission, PermissionSchema } from 'src/schemas/Permissions.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsController } from './permissions.controller';
import { PermissionGuard } from 'src/gaurds/permission.guard';
import { GroupsModule } from 'src/groups/groups.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
    GroupsModule,
  ],
  providers: [PermissionsService, PermissionGuard],
  controllers: [PermissionsController],
  exports: [PermissionsService, PermissionGuard, MongooseModule],
})
export class PermissionsModule {}
