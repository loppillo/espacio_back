import { Type } from "class-transformer";
import { IsDecimal, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    [x: string]: any;
    proId:number;

    @IsString()
    name:string;

    @IsString()
    description: string;

   @Type(() => Number)
   @IsNumber()
    price: number;


    @IsOptional()
  imageUrl?: string;
    
    @IsOptional()
    categoryId?:number;
}
