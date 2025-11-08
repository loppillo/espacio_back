import { CreateProductsOrderDto } from './dto/create-products-order.dto';
import { UpdateProductsOrderDto } from './dto/update-products-order.dto';
export declare class ProductsOrdersService {
    create(createProductsOrderDto: CreateProductsOrderDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateProductsOrderDto: UpdateProductsOrderDto): string;
    remove(id: number): string;
}
