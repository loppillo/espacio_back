import { Server } from 'socket.io';
export declare class OrdersGateway {
    server: Server;
    notifyNewOrder(order: any): void;
}
