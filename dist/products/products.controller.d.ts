import { ProductsService } from './products.service';
import { PaginationDto } from './dto/PaginationDto.dto';
import { ProductDto } from './dto/productDTO.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    updateProduct(id: number, body: any, file?: Express.Multer.File): Promise<{
        imageUrl: string;
        id: number;
        name: string;
        description: string;
        price: number;
        cantidad: number;
        categories: import("../categories/entities/category.entity").Category[];
        order: import("../orders/entities/order.entity").Order[];
        orderProducts: import("../products-orders/entities/products-order.entity").ProductsOrders[];
    }>;
    buscarProductos(nombre?: string, categorias?: string, page?: string, limit?: string): Promise<{
        data: ProductDto[];
        total: number;
        currentPage: number;
    }>;
    buscarProducto(nombre?: string, categorias?: string): Promise<ProductDto[]>;
    uploadFile(file: Express.Multer.File, name: string): Promise<{
        message: string;
        product: import("./entities/product.entity").Product;
    }>;
    findAlls(): Promise<ProductDto[]>;
    findAll(page?: number, limit?: number): Promise<PaginationDto<ProductDto>>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    create(body: any, file?: Express.Multer.File): Promise<{
        imageUrl: string;
        id: number;
        name: string;
        description: string;
        price: number;
        cantidad: number;
        categories: import("../categories/entities/category.entity").Category[];
        order: import("../orders/entities/order.entity").Order[];
        orderProducts: import("../products-orders/entities/products-order.entity").ProductsOrders[];
    }>;
}
