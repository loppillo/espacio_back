import { Order } from 'src/orders/entities/order.entity';
export declare class Mesa {
    id: number;
    numero_mesa: string;
    status: string;
    orders: Order[];
}
