import { IsNumber } from "class-validator";



export class CreateCostoEnvioDto {
    @IsNumber()
    precio_envio: number;

}
