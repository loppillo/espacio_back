import { ProductsOrdersService } from './products-orders.service';
import { CreateProductsOrderDto } from './dto/create-products-order.dto';
import { UpdateProductsOrderDto } from './dto/update-products-order.dto';
export declare class ProductsOrdersController {
    private readonly productsOrdersService;
    constructor(productsOrdersService: ProductsOrdersService);
    create(createProductsOrderDto: CreateProductsOrderDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateProductsOrderDto: UpdateProductsOrderDto): string;
    remove(id: string): string;
}
