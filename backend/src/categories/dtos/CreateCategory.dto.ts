export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  categoryName: string;
  
  @IsOptional()
  @IsString()
  categoryPath: string;
  
  @IsOptional()
  @IsString()
  categoryImage: string;
}
