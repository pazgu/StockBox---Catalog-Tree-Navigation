import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from '../schemas/Products.schema';
import { Permission, PermissionSchema } from 'src/schemas/Permissions.schema';
import { PermissionsService } from 'src/permissions/permissions.service';
import { Category, CategorySchema } from 'src/schemas/Categories.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      {
        name: Permission.name,
        schema: PermissionSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, PermissionsService],
  exports: [ProductsService],
})
export class ProductsModule {}
