import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsString()
  productPath?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  customFields?: Array<{
    _id?: string;
    title: string;
    type: 'bullets' | 'content';
    bullets?: string[];
    content?: string;
  }>;

  @IsOptional()
  productImages?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  uploadFolders?: Array<{
    title: string;
    folders: Array<{
      _id?: string;
      folderName: string;
      files: Array<{
        _id?: string;
        link: string;
      }>;
    }>;
  }>;
}
