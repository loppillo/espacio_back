import { Type } from "class-transformer";
import { IsInt, IsString, IsDecimal, IsOptional, ValidateNested, IsArray, ArrayNotEmpty, IsDate } from "class-validator";
import { CustomerDto } from "./create-customer.dto";

export class CreateSOrderDto {
  @IsOptional()
  tableNumber: number;
  @IsOptional()
  @IsString()
  detalle_venta: string;

  @IsString()
  orderType: string;

  @IsOptional()
  cantidad: number;

  @IsOptional()
  status: string;

  @IsOptional()
  @IsInt()
  propina?: number;

  @IsOptional()
  @IsInt()
  total: number;


  @IsString()
  paymentMethod: string;

  @IsOptional()
  customerId?: number; // si es un cliente existente

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDto)
  newCustomer?: CustomerDto; // si es un cliente nuevo

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  productIds?: number[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

}
