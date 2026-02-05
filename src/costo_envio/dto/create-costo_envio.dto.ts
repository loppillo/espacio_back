import { IsNumber, IsString } from "class-validator";



export class CreateCostoEnvioDto {
    @IsNumber()
    precio_envio: number;

    @IsString()
    descripcion:string;

}
