import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class DuplicateProductDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  additionalCategoryPaths: string[];
}