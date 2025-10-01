import { Gasto } from "src/gastos/entities/gasto.entity";
import { Order } from "src/orders/entities/order.entity";
export declare class Customer {
    id: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerAddress: string;
    order: Order[];
    gastos: Gasto[];
}
