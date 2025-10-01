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
exports.MesaController = void 0;
const common_1 = require("@nestjs/common");
const create_mesa_dto_1 = require("./dto/create-mesa.dto");
const update_mesa_dto_1 = require("./dto/update-mesa.dto");
const mesas_service_1 = require("./mesas.service");
let MesaController = class MesaController {
    constructor(mesaService) {
        this.mesaService = mesaService;
    }
    findAll() {
        return this.mesaService.findAll();
    }
    async obtenerMesaPorId(id) {
        return await this.mesaService.obtenerMesaPorId(id);
    }
    async getDetalleMesa(id) {
        return this.mesaService.obtenerDetalleMesa(id);
    }
    findOne(id) {
        return this.mesaService.findOne(id);
    }
    create(createMesaDto) {
        return this.mesaService.create(createMesaDto);
    }
    update(id, updateMesaDto) {
        return this.mesaService.update(id, updateMesaDto);
    }
    remove(id) {
        return this.mesaService.remove(id);
    }
    async actualizarEstadoMesa(id, status) {
        return this.mesaService.actualizarEstadoMesa(id, status);
    }
    async marcarPedidoPagado(mesaId) {
        return await this.mesaService.marcarPedidoPagado(mesaId);
    }
    getMesa(id) {
        return this.mesaService.getMesa(id);
    }
    crearNuevoPedido(id) {
        return this.mesaService.crearNuevoPedido(id);
    }
    getPedidosActuales(id, numeroVenta) {
        return this.mesaService.getPedidosActuales(id, numeroVenta);
    }
};
exports.MesaController = MesaController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('/obtener/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "obtenerMesaPorId", null);
__decorate([
    (0, common_1.Get)('/detalle/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "getDetalleMesa", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mesa_dto_1.CreateMesaDto]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_mesa_dto_1.UpdateMesaDto]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/estado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "actualizarEstadoMesa", null);
__decorate([
    (0, common_1.Patch)(':id/pagar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "marcarPedidoPagado", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "getMesa", null);
__decorate([
    (0, common_1.Post)(':id/nuevo-pedido'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "crearNuevoPedido", null);
__decorate([
    (0, common_1.Get)(':id/pedidos'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('numeroVenta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], MesaController.prototype, "getPedidosActuales", null);
exports.MesaController = MesaController = __decorate([
    (0, common_1.Controller)('mesas'),
    __metadata("design:paramtypes", [mesas_service_1.MesaService])
], MesaController);
//# sourceMappingURL=mesas.controller.js.map