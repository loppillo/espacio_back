import { CategoriaGastoService } from './categoria-gasto.service';
import { CreateCategoriaGastoDto } from './dto/create-categoria-gasto.dto';
import { UpdateCategoriaGastoDto } from './dto/update-categoria-gasto.dto';
export declare class CategoriaGastoController {
    private readonly categoriaGastoService;
    constructor(categoriaGastoService: CategoriaGastoService);
    create(createCategoriaGastoDto: CreateCategoriaGastoDto): Promise<import("./entities/categoria-gasto.entity").CategoriaGasto>;
    findAll(): Promise<import("./entities/categoria-gasto.entity").CategoriaGasto[]>;
    findOne(id: string): Promise<import("./entities/categoria-gasto.entity").CategoriaGasto>;
    update(id: string, updateCategoriaGastoDto: UpdateCategoriaGastoDto): Promise<import("./entities/categoria-gasto.entity").CategoriaGasto>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
