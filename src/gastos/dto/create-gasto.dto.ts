import { IsNumber, IsOptional } from 'class-validator';

export class CreateGastoDto {
    @IsOptional()
    @IsNumber()
    proveedorId?: number;

    @IsOptional()
    @IsNumber()
    userId?: number;
}
