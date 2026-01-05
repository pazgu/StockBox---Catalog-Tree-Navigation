import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class CustomField {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: ['bullets', 'content'] })
  type: 'bullets' | 'content';

  @Prop({ type: [String], default: [] })
  bullets?: string[];

  @Prop({ default: '' })
  content?: string;
}
