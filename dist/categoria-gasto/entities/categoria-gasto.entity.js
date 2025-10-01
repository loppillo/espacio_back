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
exports.CategoriaGasto = void 0;
const gasto_entity_1 = require("../../gastos/entities/gasto.entity");
const typeorm_1 = require("typeorm");
let CategoriaGasto = class CategoriaGasto {
};
exports.CategoriaGasto = CategoriaGasto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CategoriaGasto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], CategoriaGasto.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => gasto_entity_1.Gasto, (gasto) => gasto.categoria_gasto),
    __metadata("design:type", Array)
], CategoriaGasto.prototype, "gastos", void 0);
exports.CategoriaGasto = CategoriaGasto = __decorate([
    (0, typeorm_1.Entity)('categorias_gasto')
], CategoriaGasto);
//# sourceMappingURL=categoria-gasto.entity.js.map