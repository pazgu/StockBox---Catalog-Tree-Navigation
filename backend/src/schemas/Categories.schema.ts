import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  catName: string;

  @Prop({ required: true })
  catPath: string;

  @Prop({ required: true })
  catImage: string;

  @Prop({ required: false })
  hiddenAll?: boolean;

  @Prop({ required: false })
  hiddenGroups?: string[];

  @Prop({ required: false })
  hiddenUsers?: string[];

  @Prop({ type: Object, default: {} })
  customFields?: Record<string, any>;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
