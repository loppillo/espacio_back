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

  notifyOrderUpdated(order: any) {
    this.server.emit('orderStatusUpdated', order);
  }

  notifyMesaUpdated(mesaId: number, status: string) {
    this.server.emit('mesaStatusUpdated', { mesaId, status });
  }

}
