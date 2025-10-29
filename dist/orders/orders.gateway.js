"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let OrdersGateway = class OrdersGateway {
    notifyNewOrder(order) {
        const payload = this.sanitizeOrder(order);
        this.server.to('garzon').emit('newOrder', payload);
        this.server.to('admin').emit('newOrder', payload);
    }
    notifyOrderUpdated(order) {
        const payload = this.sanitizeOrder(order);
        this.server.to('garzon').emit('orderStatusUpdated', payload);
        this.server.to('admin').emit('orderStatusUpdated', payload);
    }
    notifyMesaUpdated(mesaId, status) {
        this.server.to('garzon').emit('mesaStatusUpdated', { mesaId, status });
        this.server.to('admin').emit('mesaStatusUpdated', { mesaId, status });
    }
    handleJoinRoom(client, payload) {
        if (payload.role === 'garzon')
            client.join('garzon');
        if (payload.role === 'admin')
            client.join('admin');
    }
    sanitizeOrder(order) {
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
};
exports.OrdersGateway = OrdersGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OrdersGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], OrdersGateway.prototype, "handleJoinRoom", null);
exports.OrdersGateway = OrdersGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.Injectable)()
], OrdersGateway);
//# sourceMappingURL=orders.gateway.js.map