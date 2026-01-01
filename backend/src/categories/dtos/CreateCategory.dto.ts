import { IsOptional, IsString } from 'class-validator';
export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  categoryName: string;

  @IsOptional()
  @IsString()
  categoryPath: string;

  @IsOptional()
  @IsString()
  categoryImage: string;
}
