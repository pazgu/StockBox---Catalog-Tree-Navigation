import { IsEnum, IsOptional } from 'class-validator';

export class MoveCategoryToRecycleBinDto {
  @IsOptional()
  @IsEnum(['cascade', 'move_up'])
  strategy?: 'cascade' | 'move_up';
}
