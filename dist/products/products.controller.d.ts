import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from './dto/PaginationDto.dto';
import { ProductDto } from './dto/productDTO.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    updateProduct(id: number, updateProductDto: UpdateProductDto, file?: Express.Multer.File): Promise<{
        imageUrl: string;
        id: number;
        category: import("../categories/entities/category.entity").Category;
        name: string;
        description: string;
        price: number;
        cantidad: number;
        order: import("../orders/entities/order.entity").Order[];
        orderProducts: import("../products-orders/entities/products-order.entity").ProductsOrders[];
    }>;
    buscarProductos(nombre?: string, categoriaId?: string, page?: string, limit?: string): Promise<{
        data: ProductDto[];
        total: number;
        currentPage: number;
    }>;
    uploadFile(file: Express.Multer.File, name: string): Promise<{
        message: string;
        product: import("./entities/product.entity").Product;
    }>;
    findAll(page?: number, limit?: number): Promise<PaginationDto<ProductDto>>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
    create(createProductDto: CreateProductDto, file: Express.Multer.File): Promise<{
        imageUrl: string;
        id: number;
        category: import("../categories/entities/category.entity").Category;
        name: string;
        description: string;
        price: number;
        cantidad: number;
        order: import("../orders/entities/order.entity").Order[];
        orderProducts: import("../products-orders/entities/products-order.entity").ProductsOrders[];
    }>;
    update(id: number, updateProductDto: UpdateProductDto): Promise<{
        imageUrl: string;
        id: number;
        category: import("../categories/entities/category.entity").Category;
        name: string;
        description: string;
        price: number;
        cantidad: number;
        order: import("../orders/entities/order.entity").Order[];
        orderProducts: import("../products-orders/entities/products-order.entity").ProductsOrders[];
    }>;
}
