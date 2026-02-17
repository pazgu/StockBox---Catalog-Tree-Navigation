/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from '../schemas/Products.schema';
import { Category, CategorySchema } from '../schemas/Categories.schema';
import { AuthModule } from 'src/auth/auth.module';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { Group, GroupSchema } from 'src/schemas/Groups.schema';
import { UsersModule } from 'src/users/users.module';
import { NameLock, NameLockSchema } from 'src/schemas/NameLock.schema';
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Group.name, schema: GroupSchema },
      { name: NameLock.name, schema: NameLockSchema },
    ]),
    PermissionsModule,
    UsersModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
