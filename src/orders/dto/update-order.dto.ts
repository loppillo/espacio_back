import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsDecimal, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto  {
    @IsInt()
    tableNumber: number;
  

    @IsString()
    orderType: string
  
    @IsString()
    status:string;
  

    @IsDecimal({ decimal_digits: '3', force_decimal: true }, { message: 'El valor debe ser un decimal con 3 dígitos decimales, por ejemplo, 2.000' })
    total: number;
  
   
    createdAt: Date;


    @IsOptional()
    userId?: number;
  
    @IsOptional()
    customerId?: number;
}
