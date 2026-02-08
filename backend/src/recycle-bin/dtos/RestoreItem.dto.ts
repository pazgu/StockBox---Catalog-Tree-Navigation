import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class RestoreItemDto {
  @IsString()
  itemId: string;

  @IsOptional()
  @IsBoolean()
  restoreChildren?: boolean;
}