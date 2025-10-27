import { Server } from 'socket.io';
export declare class OrdersGateway {
    server: Server;
    notifyNewOrder(order: any): void;
    notifyOrderUpdated(order: any): void;
    notifyMesaUpdated(mesaId: number, status: string): void;
}
