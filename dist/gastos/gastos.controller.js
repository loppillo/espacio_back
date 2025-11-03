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
exports.GastosController = void 0;
const common_1 = require("@nestjs/common");
const gastos_service_1 = require("./gastos.service");
let GastosController = class GastosController {
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    async getBalance(startDate, endDate) {
        return this.expensesService.getBalancePorFecha(startDate, endDate);
    }
    async getBalancePorAnio(anio) {
        return this.expensesService.getBalancePorAnio(anio);
    }
    async getBalanceDiario(fecha) {
        if (!fecha) {
            throw new common_1.BadRequestException('La fecha es requerida en formato YYYY-MM-DD');
        }
        return this.expensesService.getBalanceDiario(fecha);
    }
    getMensual(anio) {
        return this.expensesService.getBalanceMensual(anio);
    }
    getAnual() {
        return this.expensesService.getBalanceAnual();
    }
    getAll() {
        return this.expensesService.findAll();
    }
    getOne(id) {
        return this.expensesService.findOne(id);
    }
    async crearGasto(body) {
        return await this.expensesService.crearGastoManual(body);
    }
    remove(id) {
        return this.expensesService.remove(id);
    }
};
exports.GastosController = GastosController;
__decorate([
    (0, common_1.Get)('balances'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GastosController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('balancesA'),
    __param(0, (0, common_1.Query)('anio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GastosController.prototype, "getBalancePorAnio", null);
__decorate([
    (0, common_1.Get)('ventas-diarias'),
    __param(0, (0, common_1.Query)('fecha')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GastosController.prototype, "getBalanceDiario", null);
__decorate([
    (0, common_1.Get)('mensual'),
    __param(0, (0, common_1.Query)('anio', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], GastosController.prototype, "getMensual", null);
__decorate([
    (0, common_1.Get)('anual'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GastosController.prototype, "getAnual", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GastosController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GastosController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GastosController.prototype, "crearGasto", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GastosController.prototype, "remove", null);
exports.GastosController = GastosController = __decorate([
    (0, common_1.Controller)('gastos'),
    __metadata("design:paramtypes", [gastos_service_1.GastosService])
], GastosController);
//# sourceMappingURL=gastos.controller.js.map