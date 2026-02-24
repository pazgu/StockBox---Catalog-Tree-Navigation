/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ImageDto } from 'src/common/dtos/Image.dto';

export class CreateProductDto {
  @IsString()
  productName: string;

  @IsString()
  productPath: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

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
  @Transform(({ value }) => {
    if (!value) return [];
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  productImages?: ImageDto[];
}
