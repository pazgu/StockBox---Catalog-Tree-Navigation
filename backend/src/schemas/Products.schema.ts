import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true ,unique:true})
  productName: string;

  @Prop({ required: true })
  productImage: string;

  @Prop({ required: false })
  productDescription: string;

  @Prop({ required: true })
  productPath: string;

  @Prop({ type: Object, default: {} })
  customFields: Record<string, any>;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
