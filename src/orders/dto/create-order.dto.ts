import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';


class OrderProductDto {
  @IsInt()
  id: number; // id del producto

  @IsInt()
  cantidad: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsInt()
  tableNumber?: number;

  @IsString()
  orderType: string;

  @IsOptional()
  @IsString()
  detalle_venta?: string;

  @IsInt()
  propina: number;

  @IsString()
  status: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsInt()
  mesaId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}