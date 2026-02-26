import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  categoryName: string;

  @IsString()
  categoryPath: string;

  @IsOptional()
  @IsString()
  categoryImage: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  allowAll: boolean;
}
