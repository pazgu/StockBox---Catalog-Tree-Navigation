import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  groupName?: string;

  @IsArray()
  @IsOptional()
  members?: string[];
}
