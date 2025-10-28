import { Server } from 'socket.io';
import { Order } from './entities/order.entity';
export interface OrderDTO {
    id: number;
    orderType: string;
    detalle_venta: string;
    status: string;
    paymentMethod: string;
    total: number;
    numeroVenta: number;
    propina: number;
    createdAt: Date;
    customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
    } | null;
    products: {
        productId: number;
        name: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }[];
    mesa: {
        id: number;
        numero_mesa: string;
    } | null;
}
export declare class OrdersGateway {
    server: Server;
    notifyNewOrder(order: OrderDTO): void;
    notifyOrderUpdated(order: Order): void;
    notifyMesaUpdated(mesaId: number, status: string): void;
    private sanitizeOrder;
}
