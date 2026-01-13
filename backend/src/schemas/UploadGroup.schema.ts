import { Prop, Schema } from "@nestjs/mongoose";
import { UploadFolder } from "./UploadFolders.schema";


@Schema()
export class UploadGroup {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [UploadFolder], default: [] })
  folders: UploadFolder[];
}
