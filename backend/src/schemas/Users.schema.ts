import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserRole {
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Schema()
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.VIEWER,
  })
  role: UserRole;

  @Prop({ type: [String], default: [] })
  favorites: string[];

  @Prop({ required: true, default: false })
  approved: boolean;

  @Prop({ type: Date, default: null })
  requestSentAt: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
