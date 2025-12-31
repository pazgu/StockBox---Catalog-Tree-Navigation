import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category, CategorySchema } from 'src/schemas/Categories.schema';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';

@Module({
  imports: [MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ])],
  providers: [CategoriesService],
  controllers: [CategoriesController]
})
export class CategoriesModule {}
