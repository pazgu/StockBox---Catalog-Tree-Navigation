import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CustomField } from './CustomFields.schema';
import { UploadGroup } from './UploadGroup.schema';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class ProductImage {
  @Prop({ required: true })
  Image_url: string;

  @Prop({ default: 1 })
  zoom: number;

  @Prop({ default: 0 })
  offsetX: number;

  @Prop({ default: 0 })
  offsetY: number;
}
const ProductImageSchema = SchemaFactory.createForClass(ProductImage);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  productName: string;

  @Prop({ type: [ProductImageSchema], default: [] })
  productImages: ProductImage[];

  @Prop({ required: false })
  productDescription: string;

  @Prop({ required: true })
  productPath: Array<string>;

  @Prop({ type: [CustomField], default: [] })
  customFields: CustomField[];

  @Prop({ type: [UploadGroup], default: [] })
  uploadFolders: UploadGroup[];
}
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ productName: 'text' }, { name: 'product_text_search' });
export type ProductDocument = HydratedDocument<Product>;

ProductSchema.index({ productPath: 1 });
