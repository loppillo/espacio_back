import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsArray, IsString, ValidateNested, IsNumber } from 'class-validator';

class OrderProductDto {
  @IsInt()
  id: number; // id del producto

  @IsInt()
  cantidad: number;
}


export class CreateSOrderDto {
  @IsOptional()
  @IsInt()
  mesaId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];

  @IsOptional()
  @IsInt()
  customerId?: number;

  @IsOptional()
  @IsInt()
  cantidad?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsNumber()
  propina?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  detalle_venta?: string;

  @IsOptional()
  newCustomer?: {
    name: string;
    email?: string;
    direccion?: string;
    telefono?: string;
  };
}
