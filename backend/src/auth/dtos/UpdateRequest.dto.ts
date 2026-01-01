import { IsString, IsUUID } from 'class-validator';

export class UpdateRequestDto {
  @IsString()
  userId: string;
}
