import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsArray, IsString, ValidateNested } from 'class-validator';

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
  cantidad?: number;

  @IsOptional()
  total?: number;

  @IsOptional()
  propina?: number;

  @IsOptional()
  status?: string;

  @IsOptional()
  orderType?: string;

  @IsOptional()
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
