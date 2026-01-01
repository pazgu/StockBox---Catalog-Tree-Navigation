import { IsArray, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BlockType } from '../schemas/About.schema';

export class AboutBlockDto {
  @IsString()
  id: string;

  type: BlockType;

  data: any;
}

export class UpdateAboutDto {
  @IsOptional()
  @IsArray()
  @Type(() => AboutBlockDto)
  blocks?: AboutBlockDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class AboutImagesDto {
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
