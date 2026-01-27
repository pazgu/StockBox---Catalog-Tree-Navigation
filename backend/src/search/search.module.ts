import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Product, ProductSchema } from 'src/schemas/Products.schema';
import { Category, CategorySchema } from 'src/schemas/Categories.schema';
import { PermissionsModule } from '../permissions/permissions.module';
import { Group, GroupSchema } from 'src/schemas/Groups.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Group.name, schema: GroupSchema },
    ]),
    PermissionsModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
