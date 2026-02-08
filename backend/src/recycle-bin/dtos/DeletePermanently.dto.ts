import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class DeletePermanentlyDto {
  @IsString()
  itemId: string;

  @IsOptional()
  @IsBoolean()
  deleteChildren?: boolean;
}