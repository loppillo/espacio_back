import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateIngresoDto {
    @IsString()
    @IsNotEmpty()
    concepto: string;

    @IsDateString()
    @IsNotEmpty()
    fecha: string;

    @IsString()
    @IsNotEmpty()
    metodo_pago: string;

    @IsNumber()
    @IsNotEmpty()
    monto: number;

    @IsArray()
    @IsOptional()
    categoriasIds?: number[];

    @IsArray()
    @IsOptional()
    clientesIds?: number[];
}
