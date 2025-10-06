import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  cantidad?: number;

  @IsArray()
  @IsNotEmpty()
  categoryIds: number[];

  @IsOptional()
  imageUrl?: string;
}
