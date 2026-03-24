import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CustomField } from './CustomFields.schema';
import { UploadGroup } from './UploadGroup.schema';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  productName: string;

  @Prop({ type: [String], default: [] })
  productImages: string[];

  @Prop({ required: false })
  productDescription: string;

  @Prop({ required: true })
  productPath: Array<string>;

  @Prop({ type: [CustomField], default: [] })
  customFields: CustomField[];

  @Prop({ type: [UploadGroup], default: [] })
  uploadFolders: UploadGroup[];

  @Prop({ type: Boolean, default: false })
  isBlocked: boolean;

  @Prop({ type: Date, default: null })
  blockedAt: Date | null;

  @Prop({
    type: {
      _id: false,
      userId: { type: Types.ObjectId, ref: 'User' },
      userName: String,
    },
    default: null,
  })
  blockedBy: { userId: Types.ObjectId; userName: string } | null;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ productName: 'text' }, { name: 'product_text_search' });
export type ProductDocument = HydratedDocument<Product>;

ProductSchema.index({ productPath: 1 });
