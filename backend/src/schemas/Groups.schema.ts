import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true, unique: true })
  groupName: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  members: string[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
export type GroupDocument = HydratedDocument<Group>;
