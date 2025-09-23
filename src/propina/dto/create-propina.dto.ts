import { IsDecimal, IsOptional } from "class-validator";

export class CreatePropinaDto {


    @IsDecimal({ decimal_digits: '3', force_decimal: true }, { message: 'El valor debe ser un decimal con 3 dígitos decimales, por ejemplo, 2.000' })
    amount: number;
    
    @IsOptional()
    orderId?:number;

    
}
