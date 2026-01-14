import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum UserRole {
  EDITOR = 'editor',
  VIEWER = 'viewer',
}
export enum FavoriteType {
  PRODUCT = 'product',
  CATEGORY = 'category',
}
@Schema({ _id: false })
export class FavoriteItem {
  @Prop({ type: Types.ObjectId, required: true })
  id: Types.ObjectId;

  @Prop({ type: String, enum: FavoriteType, required: true })
  type: FavoriteType;
}
const FavoriteItemSchema = SchemaFactory.createForClass(FavoriteItem);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Prop({
    type: [FavoriteItemSchema],
    default: [],
  })
  favorites: FavoriteItem[];

  @Prop({ required: true, default: false })
  approved: boolean;

  @Prop({ required: true, default: false })
  requestSent: boolean;

  @Prop({ required: true, default: false })
  isBlocked: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ approved: 1 });
UserSchema.index({ isBlocked: 1 });
