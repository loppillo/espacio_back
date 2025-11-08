"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriaGastoModule = void 0;
const common_1 = require("@nestjs/common");
const categoria_gasto_controller_1 = require("./categoria-gasto.controller");
const typeorm_1 = require("@nestjs/typeorm");
const gasto_entity_1 = require("../gastos/entities/gasto.entity");
const categoria_gasto_service_1 = require("./categoria-gasto.service");
const categoria_gasto_entity_1 = require("./entities/categoria-gasto.entity");
let CategoriaGastoModule = class CategoriaGastoModule {
};
exports.CategoriaGastoModule = CategoriaGastoModule;
exports.CategoriaGastoModule = CategoriaGastoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([gasto_entity_1.Gasto, categoria_gasto_entity_1.CategoriaGasto])],
        controllers: [categoria_gasto_controller_1.CategoriaGastoController],
        providers: [categoria_gasto_service_1.CategoriaGastoService],
    })
], CategoriaGastoModule);
//# sourceMappingURL=categoria-gasto.module.js.map