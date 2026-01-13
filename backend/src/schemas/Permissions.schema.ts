import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { SchemaFactory } from '@nestjs/mongoose';
export enum EntityType {
  PRODUCT = 'product',
  CATEGORY = 'category',
}

@Schema({ timestamps: true })
export class Permission {
  @Prop({
    type: String,
    enum: EntityType,
  })
  entityType: EntityType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType',
  })
  entityId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  })
  allowed: mongoose.Types.ObjectId;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
PermissionSchema.index({ allowed: 1 });
