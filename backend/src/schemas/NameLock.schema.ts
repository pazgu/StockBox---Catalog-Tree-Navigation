import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NameLockDocument = NameLock & Document;

@Schema({ timestamps: true })
export class NameLock {
  @Prop({ required: true })
  nameKey: string;

  @Prop({ required: true, enum: ['product', 'category'] })
  type: 'product' | 'category';

  @Prop({ required: true })
  refId: string;
}

export const NameLockSchema = SchemaFactory.createForClass(NameLock);

NameLockSchema.index({ nameKey: 1 }, { unique: true });
