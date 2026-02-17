import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export interface MovedChild {
  itemId: Types.ObjectId;
  itemType: 'category' | 'product';
  previousPath: string | string[];
  newPath: string | string[];
}

@Schema({ timestamps: true })
export class RecycleBin {
  _id?: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  itemId: Types.ObjectId;

  @Prop({ required: true, enum: ['category', 'product'] })
  itemType: 'category' | 'product';

  @Prop({ required: true })
  itemName: string;

  @Prop({ required: false })
  itemImage: string;

  @Prop({ required: true })
  originalPath: string;

  @Prop({ required: true, type: Date, default: Date.now })
  deletedAt: Date;

  @Prop({ required: false, type: Types.ObjectId })
  deletedBy: Types.ObjectId;

  @Prop({ required: false, type: Number, default: 0 })
  childrenCount: number;

  @Prop({ required: false })
  productDescription?: string;

  @Prop({ type: [String], default: [] })
  productImages?: string[];

  @Prop({ type: Array, default: [] })
  customFields?: any[];

  @Prop({ type: Array, default: [] })
  uploadFolders?: any[];

  @Prop({ type: [String], default: [] })
  allProductPaths?: string[];

  @Prop({ required: false })
  specificPathDeleted?: string;

  @Prop({ required: false, type: Boolean })
  permissionsInheritedToChildren?: boolean;

  @Prop({ required: false })
  categoryPath?: string;

  @Prop({ type: Array, default: [] })
  descendants?: any[];

  @Prop({ type: Array, default: [] })
  storedPermissions?: any[];

  @Prop({ type: Array, default: [] })
  movedChildren?: MovedChild[];

  @Prop({ required: false, type: Number, default: 0 })
  movedChildrenCount?: number;
}

export const RecycleBinSchema = SchemaFactory.createForClass(RecycleBin);
export type RecycleBinDocument = HydratedDocument<RecycleBin>;

RecycleBinSchema.index({ itemType: 1, deletedAt: -1 });
RecycleBinSchema.index({ itemId: 1 });
