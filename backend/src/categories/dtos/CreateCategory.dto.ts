import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ImageDto } from 'src/common/dtos/Image.dto'; // ← הנתיב שלך

export class CreateCategoryDto {
  @IsString()
  categoryName: string;

  @IsString()
  categoryPath: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImageDto)
  categoryImage?: ImageDto;
}
