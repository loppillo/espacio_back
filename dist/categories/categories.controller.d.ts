import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findName(name?: string): Promise<import("./entities/category.entity").Category[]>;
    createCategory(categoria: {
        nombre: string;
        icono: string;
    }): Promise<import("./entities/category.entity").Category>;
    findAll(): Promise<import("./entities/category.entity").Category[]>;
    findOne(id: string): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<import("typeorm").UpdateResult>;
    eliminarCategoria(id: number): Promise<void>;
}
