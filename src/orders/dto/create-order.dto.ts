import {
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsInt()
  tableNumber?: number;

  @IsOptional()
  @IsString()
  detalle_venta: string;

  @IsOptional()
  @IsString()
  orderType: string;

  @IsInt()
  cantidad: number;

  @IsOptional()
  @IsInt()
  propina?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  total: number;

 @IsOptional()
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  productIds?: number[];

  // 👇 NUEVO: Añadimos el ID de la mesa
  @IsOptional()
  mesaId?: number;
}
