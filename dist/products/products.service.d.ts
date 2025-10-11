import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/PaginationDto.dto';
import { ProductDto } from './dto/productDTO.dto';
export declare class ProductsService {
    private readonly categoryRepository;
    private readonly proRepository;
    constructor(categoryRepository: Repository<Category>, proRepository: Repository<Product>);
    createProductWithImage(name: string, imageUrl: string): Promise<Product>;
    create(createProductDto: CreateProductDto): Promise<Product>;
    updateImage(id: number, body: any, imagePath?: string): Promise<Product>;
    findAll(page?: number, limit?: number): Promise<PaginationDto<ProductDto>>;
    findAlls(): Promise<ProductDto[]>;
    buscarPorNombre(nombre?: string, categoryIds?: number[], page?: number, limit?: number): Promise<{
        data: ProductDto[];
        total: number;
        currentPage: number;
    }>;
    buscarPorNombres(nombre?: string, categoryIds?: number[]): Promise<ProductDto[]>;
    findOne(id: number): Promise<Product>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
