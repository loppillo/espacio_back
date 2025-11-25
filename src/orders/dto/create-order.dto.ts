import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  IsString,
  ValidateNested,
  IsNumber,
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

export class ProductoCantidadDto {
  @IsNumber()
  productId: number;
  @IsNumber()
  cantidad: number;
}
export class AgregarProductosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoCantidadDto)
  productos: ProductoCantidadDto[];
}