import { Server } from 'socket.io';
import { Order } from './entities/order.entity';
export declare class OrdersGateway {
    server: Server;
    notifyNewOrder(order: Order): void;
    notifyOrderUpdated(order: Order): void;
    notifyMesaUpdated(mesaId: number, status: string): void;
    private sanitizeOrder;
}
