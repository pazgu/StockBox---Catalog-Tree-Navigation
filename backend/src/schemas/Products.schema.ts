import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CustomField } from './CustomFields.schema';
import { UploadGroup } from './UploadGroup.schema';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  productName: string;

  @Prop({ type: [String], default: [] })
  productImages: string[];

  @Prop({ required: false })
  productDescription: string;

  @Prop({ required: true })
  productPath: string;

  @Prop({ type: [CustomField], default: [] })
  customFields: CustomField[];

  @Prop({ type: [UploadGroup], default: [] })
  uploadFolders: UploadGroup[];
}
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index(
  { productName: 'text' },
  { name: 'product_text_search' }
);
export type ProductDocument = HydratedDocument<Product>;

ProductSchema.index({ productPath: 1 });
