import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  productName: string;

  @IsString()
  productPath: string;

  @IsOptional()
  @IsString()
  productDescription?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    }
  })
  customFields?: Record<string, any>;

  @IsOptional()
  @IsString()
  productImage?: string;
}
