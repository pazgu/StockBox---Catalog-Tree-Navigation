import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  categoryName: string;

  @IsString()
  categoryPath: string;

  @IsOptional()
  @IsString()
  categoryImage: string;
}
