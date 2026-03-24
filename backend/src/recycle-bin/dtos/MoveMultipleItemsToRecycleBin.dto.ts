import {
  IsArray,
  ArrayNotEmpty,
  IsString,
  IsIn,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MoveMultipleRecycleBinItemDto {
  @IsString()
  id: string;

  @IsIn(['category', 'product'])
  type: 'category' | 'product';

  @IsOptional()
  @IsString()
  categoryPath?: string;

  @IsOptional()
  @IsIn(['cascade', 'move_up'])
  strategy?: 'cascade' | 'move_up';
}

export class MoveMultipleItemsToRecycleBinDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MoveMultipleRecycleBinItemDto)
  items: MoveMultipleRecycleBinItemDto[];
}