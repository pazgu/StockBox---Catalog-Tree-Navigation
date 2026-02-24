import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CategoryImageDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  zoom?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offsetX?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offsetY?: number;
}

export class CreateCategoryDto {
  @IsString()
  categoryName: string;

  @IsString()
  categoryPath: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryImageDto)
  categoryImage?: CategoryImageDto;
}
