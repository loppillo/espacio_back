import { IsOptional, IsString, IsInt, IsArray } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  price?: number;

  @IsOptional()
  cantidad?: number;

   @IsOptional()
  @IsArray()
  categories?: number[];
}

