import { Order } from 'src/orders/entities/order.entity';
export declare class User {
    id: number;
    name: string;
    password: string;
    profileImage: string;
    role: string;
    order: Order[];
}
