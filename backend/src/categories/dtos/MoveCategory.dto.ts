import { IsString, IsNotEmpty } from 'class-validator';

export class MoveCategoryDto {
  @IsString()
  @IsNotEmpty()
  newParentPath: string;
}

