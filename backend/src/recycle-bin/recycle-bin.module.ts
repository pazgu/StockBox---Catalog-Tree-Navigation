import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecycleBinController } from './recycle-bin.controller';
import { RecycleBinService } from './recycle-bin.service';
import { RecycleBin, RecycleBinSchema } from 'src/schemas/RecycleBin.schema';
import { Category, CategorySchema } from 'src/schemas/Categories.schema';
import { Product, ProductSchema } from 'src/schemas/Products.schema';
import { PermissionsModule } from 'src/permissions/permissions.module';
import { NameLock, NameLockSchema } from 'src/schemas/NameLock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecycleBin.name, schema: RecycleBinSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: NameLock.name, schema: NameLockSchema },
    ]),
    PermissionsModule,
  ],
  controllers: [RecycleBinController],
  providers: [RecycleBinService],
  exports: [RecycleBinService],
})
export class RecycleBinModule {}
