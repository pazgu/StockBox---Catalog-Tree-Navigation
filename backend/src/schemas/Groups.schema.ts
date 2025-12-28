import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Group {
  @Prop({ required: true, unique: true })
  groupName: string;

  @Prop({ required: false, default: [] })
  members: string[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
