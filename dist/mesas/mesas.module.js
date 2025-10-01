"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MesasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mesas_service_1 = require("./mesas.service");
const mesas_controller_1 = require("./mesas.controller");
const mesa_entity_1 = require("./entities/mesa.entity");
const order_entity_1 = require("../orders/entities/order.entity");
let MesasModule = class MesasModule {
};
exports.MesasModule = MesasModule;
exports.MesasModule = MesasModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([mesa_entity_1.Mesa]), typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order])],
        controllers: [mesas_controller_1.MesaController],
        providers: [mesas_service_1.MesaService],
    })
], MesasModule);
//# sourceMappingURL=mesas.module.js.map