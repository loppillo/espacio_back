import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Ajusta al dominio de tu frontend en producción
  },
})
@Injectable()
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  // Método para emitir nuevo pedido
  notifyNewOrder(order: any) {
    this.server.emit('newOrder', order);
  }
}
