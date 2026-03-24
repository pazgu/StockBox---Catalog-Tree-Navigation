import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class MoveMultipleCategoriesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  categoryIds: string[];

  @IsString()
  newParentPath: string;
}
