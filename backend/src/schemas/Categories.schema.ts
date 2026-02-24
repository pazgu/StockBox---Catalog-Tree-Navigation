import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class CategoryImage {
  @Prop({ required: true, default: '' })
  Image_url: string;

  @Prop({ default: 1 })
  zoom: number;

  @Prop({ default: 0 })
  offsetX: number;

  @Prop({ default: 0 })
  offsetY: number;
}
const CategoryImageSchema = SchemaFactory.createForClass(CategoryImage);

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  categoryName: string;

  @Prop({ required: true })
  categoryPath: string;

  @Prop({
    type: CategoryImageSchema,
    default: () => ({ Image_url: '', zoom: 1, offsetX: 0, offsetY: 0 }),
  })
  categoryImage?: CategoryImage;

  @Prop({ default: true })
  permissionsInheritedToChildren: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index(
  { categoryName: 'text' },
  { name: 'category_text_search' },
);
export type CategoryDocument = HydratedDocument<Category>;

CategorySchema.index({ categoryPath: 1 });
