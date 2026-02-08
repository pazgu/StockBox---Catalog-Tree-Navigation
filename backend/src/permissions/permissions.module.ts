import { forwardRef, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { Permission, PermissionSchema } from 'src/schemas/Permissions.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionsController } from './permissions.controller';
import { PermissionGuard } from 'src/gaurds/permission.guard';
import { GroupsModule } from 'src/groups/groups.module';
import { Category, CategorySchema } from 'src/schemas/Categories.schema';
import { UsersModule } from 'src/users/users.module';
import { Product, ProductSchema } from 'src/schemas/Products.schema';
import { Group, GroupSchema } from 'src/schemas/Groups.schema';
import { User, UserSchema } from 'src/schemas/Users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => GroupsModule),
  ],
  providers: [PermissionsService, PermissionGuard],
  controllers: [PermissionsController],
  exports: [PermissionsService, PermissionGuard, MongooseModule],
})
export class PermissionsModule {}
