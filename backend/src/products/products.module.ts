import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from '../schemas/Products.schema';
import { Category, CategorySchema } from '../schemas/Categories.schema'; // Add this
import { AuthModule } from 'src/auth/auth.module';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema }, 
    ]),
    PermissionsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
