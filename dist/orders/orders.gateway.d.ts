import { Server } from 'socket.io';
import { Order } from './entities/order.entity';
export interface OrderDTO {
    id: number;
    tableNumber: number | null;
    orderType: string;
    detalle_venta: string | null;
    estado: string;
    propina: number;
    status: string;
    total: number;
    createdAt: Date;
    paymentMethod: string | null;
    numeroVenta: number;
    mesa: {
        id: number;
        numero_mesa: string;
    } | null;
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
        imageUrl?: string;
    }[];
}
export declare class OrdersGateway {
    server: Server;
    handlePrint(data: any): Promise<{
        status: string;
        message: any;
    }>;
    notifyNewOrder(order: any): void;
    notifyOrderUpdated(order: Order): void;
    notifyMesaUpdated(mesaId: number, status: string): void;
    notifyOrderAccepted(order: Order): void;
    sanitizeOrder(order: Order): OrderDTO;
}
