import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/PaginationDto.dto';
import { ProductDto } from './dto/productDTO.dto';
import { CacheService } from '../common/cache.service';
import { LightweightProductDto } from './dto/lightweight-product.dto';
export declare class ProductsService {
    private readonly categoryRepository;
    private readonly proRepository;
    private readonly cacheService;
    constructor(categoryRepository: Repository<Category>, proRepository: Repository<Product>, cacheService: CacheService);
    createProductWithImage(name: string, imageUrl: string): Promise<Product>;
    create(createProductDto: CreateProductDto): Promise<Product>;
    updateImage(id: number, body: any, imagePath?: string): Promise<{
        imageUrl: string;
        id: number;
        name: string;
        description: string;
        price: number;
        cantidad: number;
        categories: Category[];
        order: import("../orders/entities/order.entity").Order[];
        orderProducts: import("../products-orders/entities/products-order.entity").ProductsOrders[];
    }>;
    private normalizeProduct;
    findAll(page?: number, limit?: number): Promise<PaginationDto<ProductDto>>;
    findAlls(): Promise<ProductDto[]>;
    buscarPorNombre(nombre?: string, categoryIds?: number[], page?: number, limit?: number, includeImages?: boolean, lightweight?: boolean): Promise<{
        data: ProductDto[] | LightweightProductDto[];
        total: number;
        currentPage: number;
    }>;
    buscarPorNombres(nombre?: string, categoryIds?: number[]): Promise<ProductDto[]>;
    findOne(id: number): Promise<Product>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
