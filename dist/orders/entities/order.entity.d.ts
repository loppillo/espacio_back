import { Customer } from 'src/customer/entities/customer.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { User } from 'src/users/entities/user.entity';
export declare class Order {
    id: number;
    tableNumber: number;
    orderType: string;
    detalle_venta: string;
    estado: string;
    propina: number;
    status: string;
    total: number;
    createdAt: Date;
    paymentMethod: string;
    user: User;
    customer: Customer;
    orderProducts: ProductsOrders[];
    mesa: Mesa;
    deletedAt?: Date;
    numeroVenta: number;
}
