import { IsEnum, IsNotEmpty, IsMongoId, IsOptional } from 'class-validator';
import { EntityType } from 'src/schemas/Permissions.schema';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsEnum(EntityType, {
    message: 'entityType must be either "product" or "category"',
  })
  entityType: EntityType;

  @IsNotEmpty()
  @IsMongoId({ message: 'entityId must be a valid MongoDB ObjectId' })
  entityId: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'allowed must be a valid MongoDB ObjectId' })
  allowed: string;
  
  @IsOptional()
  inheritToChildren?: boolean;
}
