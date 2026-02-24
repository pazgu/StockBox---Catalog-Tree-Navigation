import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ImageDto {
  @IsString()
  Image_url: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  zoom?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offsetX?: number = 0;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offsetY?: number = 0;
}
