import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  categoryName: string;

  @Prop({ required: true })
  categoryPath: string;

  @Prop({ required: false, default: '' })
  categoryImage?: string;
  
  @Prop({ default: false })
  permissionsInheritedToChildren: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index(
  { categoryName: 'text' },
  { name: 'category_text_search' },
);
export type CategoryDocument = HydratedDocument<Category>;

CategorySchema.index({ categoryPath: 1 });
