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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const create_sorder_1 = require("./dto/create.sorder");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("./entities/order.entity");
const typeorm_2 = require("typeorm");
let OrdersController = class OrdersController {
    constructor(ordersService, orderRepository) {
        this.ordersService = ordersService;
        this.orderRepository = orderRepository;
    }
    create(createOrderDto) {
        return this.ordersService.create(createOrderDto);
    }
    creates(createOrderDto) {
        return this.ordersService.creates(createOrderDto);
    }
    findAll() {
        return this.ordersService.findAll();
    }
    findOne(id) {
        return this.ordersService.findOne(+id);
    }
    update(id, updateOrderDto) {
        return this.ordersService.update(+id, updateOrderDto);
    }
    remove(id) {
        return this.ordersService.remove(+id);
    }
    cancelarOrden(id) {
        return this.ordersService.cancelarOrden(id);
    }
    async obtenerVentasPorDia(fecha) {
        if (!fecha) {
            throw new common_1.BadRequestException('Debe proporcionar una fecha en formato YYYY-MM-DD');
        }
        const ordenes = await this.orderRepository.find({
            where: {
                createdAt: (0, typeorm_2.Raw)(alias => `DATE(${alias}) = :fecha`, { fecha })
            },
            order: { id: 'DESC' }
        });
        const ordenesConTotal = ordenes.map(orden => ({
            id: orden.id,
            fecha: orden.createdAt,
            status: orden.status,
            total: orden.total
        }));
        return ordenesConTotal;
    }
    async getProductosPorMesa(mesaId) {
        return this.ordersService.getProductosPorMesa(+mesaId);
    }
    async eliminarProducto(orderId, productId) {
        return this.ordersService.eliminarProducto(+orderId, +productId);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('s'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sorder_1.CreateSOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "creates", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/cancelar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "cancelarOrden", null);
__decorate([
    (0, common_1.Get)('ventas/por-dia'),
    __param(0, (0, common_1.Query)('fecha')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "obtenerVentasPorDia", null);
__decorate([
    (0, common_1.Get)('mesas/:mesaId/productos'),
    __param(0, (0, common_1.Param)('mesaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getProductosPorMesa", null);
__decorate([
    (0, common_1.Delete)(':orderId/productos/:productId'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "eliminarProducto", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        typeorm_2.Repository])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map