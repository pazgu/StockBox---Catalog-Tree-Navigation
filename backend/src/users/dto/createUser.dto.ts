import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole, FavoriteType } from 'src/schemas/Users.schema';

export class FavoriteDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
  @IsEnum(FavoriteType)
  type: FavoriteType;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FavoriteDto)
  favorites?: FavoriteDto[];

  @IsBoolean()
  approved: boolean;

  @IsBoolean()
  requestSent: boolean;
  @IsBoolean()
  isBlocked: boolean;
}
