import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category, CategorySchema } from 'src/schemas/Categories.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/Products.schema';
import { Permission, PermissionSchema } from 'src/schemas/Permissions.schema'; // 1. Import Permission
import { PermissionsService } from 'src/permissions/permissions.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Permission.name,
        schema: PermissionSchema,
      },
    ]),
  ],
  providers: [CategoriesService, PermissionsService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
