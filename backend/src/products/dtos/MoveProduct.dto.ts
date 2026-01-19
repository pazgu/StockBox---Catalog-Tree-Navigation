import { IsString, IsNotEmpty } from 'class-validator';

export class MoveProductDto {
  @IsString()
  @IsNotEmpty()
  newCategoryPath: string; 
}