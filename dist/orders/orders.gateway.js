"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const pdf_to_printer_1 = require("pdf-to-printer");
const PDFDocument = __importStar(require("pdfkit"));
const fs = __importStar(require("fs"));
let OrdersGateway = class OrdersGateway {
    async handlePrint(data) {
        try {
            const filePath = `ticket-${Date.now()}.pdf`;
            const doc = new PDFDocument({ size: [250, 400], margin: 10 });
            doc.pipe(fs.createWriteStream(filePath));
            doc.fontSize(14).text('TICKET DE PEDIDO', { align: 'center', underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`Mesa: ${data.mesa}`);
            doc.text(`Total: $${data.total}`);
            doc.moveDown();
            data.items.forEach(item => {
                doc.text(`${item.cantidad} x ${item.nombre} - $${item.precio}`);
            });
            doc.end();
            await new Promise(resolve => doc.on('finish', resolve));
            await (0, pdf_to_printer_1.print)(filePath, { printer: 'pos-80' });
            return { status: 'ok', message: 'Ticket impreso correctamente' };
        }
        catch (err) {
            return { status: 'error', message: err.message };
        }
    }
    notifyNewOrder(order) {
        const sanitized = this.sanitizeOrder(order);
        this.server.emit('newOrder', sanitized);
    }
    notifyOrderUpdated(order) {
        const payload = this.sanitizeOrder(order);
        this.server.emit('orderStatusUpdated', payload);
    }
    notifyMesaUpdated(mesaId, status) {
        this.server.emit('mesaStatusUpdated', { mesaId, status });
    }
    broadcast(theme) {
        this.server.emit('themeUpdated', theme);
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
    (0, websockets_1.SubscribeMessage)('printTicket'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersGateway.prototype, "handlePrint", null);
exports.OrdersGateway = OrdersGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.Injectable)()
], OrdersGateway);
//# sourceMappingURL=orders.gateway.js.map