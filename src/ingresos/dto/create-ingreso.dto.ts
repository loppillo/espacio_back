import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateDocumentoIngresoDto } from 'src/documentos_ingreso/dto/create-documento_ingreso.dto';

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

    @IsNumber()
    @IsOptional()
    documentoId?: number;
}
