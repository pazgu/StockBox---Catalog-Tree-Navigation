import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  prodName: string;

  @Prop({ required: true })
  prodImage: string;

  @Prop({ required: false })
  prodDescription: string;

  @Prop({ required: true })
  prodPath: string;

  @Prop({ required: false })
  hiddenAll?: boolean;

  @Prop({ required: false })
  hiddenGroups?: string[];

  @Prop({ required: false })
  hiddenUsers?: string[];

  @Prop({ type: Object, default: {} })
  customFields: Record<string, any>;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
