import { IsArray, IsString, ArrayMinSize } from 'class-validator';

export class MoveProductDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  newCategoryPath: string[];
}
