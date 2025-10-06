import { Category } from 'src/categories/entities/category.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
export declare class Product {
    id: number;
    name: string;
    description: string;
    price: number;
    cantidad: number;
    imageUrl: string;
    categories: Category[];
    order: Order[];
    orderProducts: ProductsOrders[];
}
