import { Prop, Schema } from "@nestjs/mongoose";
import { UploadFile } from "./UploadFiles.schema";


@Schema()
export class UploadFolder {
  @Prop({ required: true })
  folderName: string;

  @Prop({ type: [UploadFile], default: [] })
  files: UploadFile[];
}
