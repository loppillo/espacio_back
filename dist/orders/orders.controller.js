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
const print_service_1 = require("./print/print.service");
const jwt_auth_guard_1 = require("../auth/guard/jwt-auth.guard");
const roles_guard_1 = require("../roles/roles.guard");
let OrdersController = class OrdersController {
    constructor(ordersService, orderRepository, printService) {
        this.ordersService = ordersService;
        this.orderRepository = orderRepository;
        this.printService = printService;
    }
    async obtenerPendientes() {
        return this.ordersService.obtenerPendientes();
    }
    create(createOrderDto) {
        return this.ordersService.create(createOrderDto);
    }
    async getHistorialPorMesa(mesaId) {
        console.log('🧩 Mesa ID recibido:', mesaId);
        return this.ordersService.getHistorialPorMesa(+mesaId);
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
    async eliminarProducto(orderId, productId) {
        return this.ordersService.eliminarProducto(orderId, productId);
    }
    async print(body) {
        return this.printService.printFactura(body);
    }
    async aceptarVenta(id) {
        return this.ordersService.aceptarVenta(+id);
    }
    async cancelarVenta(id) {
        return this.ordersService.cancelarVenta(+id);
    }
    async getVentasDiarias(desde, hasta, orderType) {
        return this.ordersService.getVentasDiarias(desde, hasta, orderType);
    }
    async getVentasDiariasxMesa(desde, hasta, mesaId) {
        return this.ordersService.getVentasDiariasxMesa(desde, hasta, mesaId);
    }
    async cancelarVentas(fecha, mesaId) {
        if (!fecha && !mesaId) {
            throw new common_1.BadRequestException('Debe especificar al menos una fecha o una mesa.');
        }
        return this.ordersService.cancelarVentas(fecha, mesaId);
    }
    async cancelar(id) {
        return this.ordersService.cancelar(id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)('pendientes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "obtenerPendientes", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('historial/:mesaId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('mesaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getHistorialPorMesa", null);
__decorate([
    (0, common_1.Post)('s'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sorder_1.CreateSOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "creates", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/cancelar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "cancelarOrden", null);
__decorate([
    (0, common_1.Get)('ventas/por-dia'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)('fecha')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "obtenerVentasPorDia", null);
__decorate([
    (0, common_1.Delete)(':orderId/productos/:productId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('productId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "eliminarProducto", null);
__decorate([
    (0, common_1.Post)('imprimir/factura'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "print", null);
__decorate([
    (0, common_1.Patch)(':id/aceptar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "aceptarVenta", null);
__decorate([
    (0, common_1.Patch)(':id/cancelar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelarVenta", null);
__decorate([
    (0, common_1.Get)('ventas/diarias'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)('desde')),
    __param(1, (0, common_1.Query)('hasta')),
    __param(2, (0, common_1.Query)('orderType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getVentasDiarias", null);
__decorate([
    (0, common_1.Get)('ventas/diariasMesa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)('desde')),
    __param(1, (0, common_1.Query)('hasta')),
    __param(2, (0, common_1.Query)('mesaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getVentasDiariasxMesa", null);
__decorate([
    (0, common_1.Patch)('cancelar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)('fecha')),
    __param(1, (0, common_1.Query)('mesaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelarVentas", null);
__decorate([
    (0, common_1.Patch)(':id/cancelar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelar", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        typeorm_2.Repository,
        print_service_1.PrintService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map