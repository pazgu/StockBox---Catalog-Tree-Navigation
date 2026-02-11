import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AboutDocument = About &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

export type BlockType = 'intro' | 'bullets' | 'features' | 'paragraph' | 'cta';

@Schema({ _id: false })
export class AboutBlock {
  @Prop({ required: true })
  id: string;

  @Prop({
    required: true,
    enum: ['intro', 'bullets', 'features', 'paragraph', 'cta'],
  })
  type: BlockType;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  data: any;
}
export const AboutBlockSchema = SchemaFactory.createForClass(AboutBlock);

@Schema({ _id: false })
export class AboutImage {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  public_id: string;
}
export const AboutImageSchema = SchemaFactory.createForClass(AboutImage);

@Schema({ timestamps: true, collection: 'about' })
export class About {
  @Prop({ type: String, default: 'ABOUT_SINGLETON' })
  _id: string;

  @Prop({ type: [AboutBlockSchema], default: [] })
  blocks: AboutBlock[];

  @Prop({ type: [AboutImageSchema], default: [] })
  images: AboutImage[];
}

export const AboutSchema = SchemaFactory.createForClass(About);
