/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/products/dtos/UpdateProduct.dto.ts
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ImageDto } from 'src/common/dtos/Image.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productPath?: Array<string>;

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
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  productImages?: ImageDto[];

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
      files: Array<{ _id?: string; link: string }>;
    }>;
  }>;
}
