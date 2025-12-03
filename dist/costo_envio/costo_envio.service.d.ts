import { CreateCostoEnvioDto } from './dto/create-costo_envio.dto';
import { UpdateCostoEnvioDto } from './dto/update-costo_envio.dto';
import { CostoEnvio } from './entities/costo_envio.entity';
import { Repository } from 'typeorm';
export declare class CostoEnvioService {
    private readonly costoEnvioRepository;
    constructor(costoEnvioRepository: Repository<CostoEnvio>);
    create(createCostoEnvioDto: CreateCostoEnvioDto): Promise<CostoEnvio>;
    findAll(): Promise<CostoEnvio[]>;
    findOne(id: number): Promise<CostoEnvio>;
    update(id: number, updateCostoEnvioDto: UpdateCostoEnvioDto): Promise<CostoEnvio>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
