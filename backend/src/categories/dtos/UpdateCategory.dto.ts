import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ImageDto } from 'src/common/dtos/Image.dto';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsString()
  categoryPath?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageDto)
  categoryImage?: ImageDto;
}
