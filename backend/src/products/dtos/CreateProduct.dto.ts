import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsString()
  @IsNotEmpty()
  productImage: string;

  @IsString()
  @IsOptional()
  productDescription?: string;

  @IsString()
  @IsNotEmpty()
  productPath: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}
