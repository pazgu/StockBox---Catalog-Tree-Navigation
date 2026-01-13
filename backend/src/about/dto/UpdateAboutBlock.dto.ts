import { BlockType } from '../../schemas/About.schema';

export class UpdateAboutBlockDto {
  id: string;
  type: BlockType;
  data: any;
}
