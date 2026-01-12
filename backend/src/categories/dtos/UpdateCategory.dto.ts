import { IsString, IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsString()
  categoryPath?: string;

  @IsOptional()
  @IsString()
  categoryImage?: string;
}
