import { Repository } from 'typeorm';
import { CategoriaGasto } from './entities/categoria-gasto.entity';
import { CreateCategoriaGastoDto } from './dto/create-categoria-gasto.dto';
import { UpdateCategoriaGastoDto } from './dto/update-categoria-gasto.dto';
export declare class CategoriaGastoService {
    private readonly categoriaGastoRepository;
    constructor(categoriaGastoRepository: Repository<CategoriaGasto>);
    create(createCategoriaGastoDto: CreateCategoriaGastoDto): Promise<CategoriaGasto>;
    findAll(): Promise<CategoriaGasto[]>;
    findOne(id: number): Promise<CategoriaGasto>;
    update(id: number, updateCategoriaGastoDto: UpdateCategoriaGastoDto): Promise<CategoriaGasto>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
