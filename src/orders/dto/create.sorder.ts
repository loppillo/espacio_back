import { IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateSOrderDto {
  @IsOptional()
  @IsInt()
  mesaId?: number;

  @IsOptional()
  @IsArray()
  productIds?: number[];

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

  // Si se permite crear un nuevo cliente en el mismo DTO
  @IsOptional()
  newCustomer?: {
    name: string;
    email?: string;
  };
}
