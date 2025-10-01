import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
export declare class ProductsOrders {
    orderId: number;
    productId: number;
    order: Order;
    product: Product;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}
