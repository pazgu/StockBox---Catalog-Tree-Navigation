import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserRole {
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true ,unique:true})
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  // @Prop({ type: [String], default: [] })
  // favorites: string[];

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
