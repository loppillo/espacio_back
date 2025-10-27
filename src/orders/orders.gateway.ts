import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  // Emitir nuevo pedido
  notifyNewOrder(order: Order) {
    const payload = this.sanitizeOrder(order);
    this.server.emit('newOrder', payload);
  }

  // Emitir actualización de pedido
  notifyOrderUpdated(order: Order) {
    const payload = this.sanitizeOrder(order);
    this.server.emit('orderStatusUpdated', payload);
  }

  // Emitir actualización de mesa
  notifyMesaUpdated(mesaId: number, status: string) {
    this.server.emit('mesaStatusUpdated', { mesaId, status });
  }

  // Evitar referencias circulares y objetos grandes
private sanitizeOrder(order: Order) {
  return {
    id: order.id,
    status: order.status,
    tableNumber: order.tableNumber,
    total: order.total,
    createdAt: order.createdAt,
    orderType: order.orderType,
    detalle_venta: order.detalle_venta,
    propina: order.propina,
    paymentMethod: order.paymentMethod,
    numeroVenta: order.numeroVenta,
    mesaId: order.mesaId,
    // productos relacionados
    orderProducts: order.orderProducts?.map(op => ({
      orderId: op.orderId,
      productId: op.productId,
      cantidad: op.cantidad,
      precioUnitario: op.precioUnitario,
      subtotal: op.subtotal,
      // info básica del producto
      productName: op.product?.name,
      productPrice: op.product?.price,
    })),
  };
}


}

