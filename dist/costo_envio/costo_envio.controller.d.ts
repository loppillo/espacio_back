import { CostoEnvioService } from './costo_envio.service';
import { CreateCostoEnvioDto } from './dto/create-costo_envio.dto';
import { UpdateCostoEnvioDto } from './dto/update-costo_envio.dto';
export declare class CostoEnvioController {
    private readonly costoEnvioService;
    constructor(costoEnvioService: CostoEnvioService);
    findAll(): Promise<import("./entities/costo_envio.entity").CostoEnvio[]>;
    create(createCostoEnvioDto: CreateCostoEnvioDto): Promise<import("./entities/costo_envio.entity").CostoEnvio>;
    findOne(id: string): Promise<import("./entities/costo_envio.entity").CostoEnvio>;
    update(id: string, updateCostoEnvioDto: UpdateCostoEnvioDto): Promise<import("./entities/costo_envio.entity").CostoEnvio>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
