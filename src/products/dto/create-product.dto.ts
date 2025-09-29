import { IsDecimal, IsOptional, IsString } from "class-validator";

export class CreateProductDto {
    [x: string]: any;
    proId:number;

    @IsString()
    name:string;

    @IsString()
    description: string;

    @IsString()
    price: number;


    @IsOptional()
  imageUrl?: string;
    
    @IsOptional()
    categoryId?:number;
}
