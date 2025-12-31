import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @IsArray()
  @IsOptional()
  members?: string[];
}
