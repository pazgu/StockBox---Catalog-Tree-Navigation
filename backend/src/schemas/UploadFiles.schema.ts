import { Prop, Schema } from "@nestjs/mongoose";


@Schema()
export class UploadFile {
  @Prop({ required: true })
  link: string;
}
