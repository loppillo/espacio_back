import { IsArray, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

    @IsArray()
    @IsOptional()
    categoriasIds?: number[];

    @IsArray()
    @IsOptional()
    clientesIds?: number[];
}
