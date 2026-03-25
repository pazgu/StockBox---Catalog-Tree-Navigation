import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsOptional,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MoveMultipleProductToRecycleBinItemDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  categoryPath?: string;
}

export class MoveMultipleItemsToRecycleBinDto {
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsIn(['cascade', 'move_up'])
  categoryStrategy?: 'cascade' | 'move_up';

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MoveMultipleProductToRecycleBinItemDto)
  products?: MoveMultipleProductToRecycleBinItemDto[];
}