"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GastosModule = void 0;
const common_1 = require("@nestjs/common");
const gastos_service_1 = require("./gastos.service");
const gastos_controller_1 = require("./gastos.controller");
const gasto_entity_1 = require("./entities/gasto.entity");
const typeorm_1 = require("@nestjs/typeorm");
const customer_entity_1 = require("../customer/entities/customer.entity");
const categoria_gasto_entity_1 = require("../categoria-gasto/entities/categoria-gasto.entity");
const schedule_1 = require("@nestjs/schedule");
let GastosModule = class GastosModule {
};
exports.GastosModule = GastosModule;
exports.GastosModule = GastosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([gasto_entity_1.Gasto, customer_entity_1.Customer, categoria_gasto_entity_1.CategoriaGasto]), schedule_1.ScheduleModule.forRoot(),],
        controllers: [gastos_controller_1.GastosController],
        providers: [gastos_service_1.GastosService],
    })
], GastosModule);
//# sourceMappingURL=gastos.module.js.map