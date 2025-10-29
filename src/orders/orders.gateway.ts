import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Order } from './entities/order.entity';

// DTO opcional para tipado
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
  mesa: { id: number; numero_mesa: string } | null;
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



@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

notifyNewOrder(order: any) {
  const payload = this.sanitizeOrder(order);
  // Enviar solo a meseros y admins
  this.server.to('mesero').emit('newOrder', payload);
  this.server.to('admin').emit('newOrder', payload);
}

notifyOrderUpdated(order: Order) {
  const payload = this.sanitizeOrder(order);
  this.server.to('mesero').emit('orderStatusUpdated', payload);
  this.server.to('admin').emit('orderStatusUpdated', payload);
}

notifyMesaUpdated(mesaId: number, status: string) {
  this.server.to('mesero').emit('mesaStatusUpdated', { mesaId, status });
  this.server.to('admin').emit('mesaStatusUpdated', { mesaId, status });
}

  @SubscribeMessage('joinRoom')
handleJoinRoom(client: Socket, payload: { role: string }) {
  if (payload.role === 'mesero') client.join('mesero');
  if (payload.role === 'admin') client.join('admin');
}

  // Evitar referencias circulares y objetos grandes
private sanitizeOrder(order: Order): OrderDTO {
  return {
    id: order.id,
    tableNumber: order.tableNumber ?? null,
    orderType: order.orderType,
    detalle_venta: order.detalle_venta ?? null,
    estado: order.estado,
    propina: order.propina,
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod ?? null,
    numeroVenta: order.numeroVenta,
    mesa: order.mesa
      ? { id: order.mesa.id, numero_mesa: order.mesa.numero_mesa }
      : null,
    customer: order.customer
      ? {
          id: order.customer.id,
          name: order.customer.customerName,
          email: order.customer.customerEmail,
          phone: order.customer.customerPhone,
        }
      : null,
    products: order.orderProducts?.map(op => ({
      productId: op.product.id,
      name: op.product.name,
      cantidad: op.cantidad,
      precioUnitario: op.precioUnitario,
      subtotal: op.subtotal,
      imageUrl: op.product.imageUrl ?? undefined,
    })) || [],
  };
}



}

