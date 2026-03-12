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

  @Prop({ default: true })
  permissionsInheritedToChildren: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index(
  { categoryName: 'text' },
  { name: 'category_text_search' },
);
CategorySchema.index(
  { categoryName: 1 },
  {
    name: 'category_name_search',
    collation: { locale: 'en', strength: 2 }
  }
);
export type CategoryDocument = HydratedDocument<Category>;

CategorySchema.index({ categoryPath: 1 });
