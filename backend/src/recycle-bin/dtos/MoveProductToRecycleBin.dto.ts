import { IsString, IsOptional } from 'class-validator';

export class MoveProductToRecycleBinDto {
  @IsOptional()
  @IsString()
  categoryPath?: string;
}