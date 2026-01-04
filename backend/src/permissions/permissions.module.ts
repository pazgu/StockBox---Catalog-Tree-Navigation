import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission, PermissionSchema } from 'src/schemas/Permissions.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsController } from './permissions.controller';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [PermissionsService],
})
export class PermissionsModule {}
