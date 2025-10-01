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
exports.Gasto = void 0;
const categoria_gasto_entity_1 = require("../../categoria-gasto/entities/categoria-gasto.entity");
const customer_entity_1 = require("../../customer/entities/customer.entity");
const typeorm_1 = require("typeorm");
let Gasto = class Gasto {
};
exports.Gasto = Gasto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Gasto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], Gasto.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Gasto.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Gasto.prototype, "concepto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['ingreso', 'egreso'] }),
    __metadata("design:type", String)
], Gasto.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['efectivo', 'tarjeta', 'transferencia', 'cheque'], default: 'efectivo' }),
    __metadata("design:type", String)
], Gasto.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, (customer) => customer.gastos, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", customer_entity_1.Customer)
], Gasto.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => categoria_gasto_entity_1.CategoriaGasto, (categoria) => categoria.gastos, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'categoriaId' }),
    __metadata("design:type", categoria_gasto_entity_1.CategoriaGasto)
], Gasto.prototype, "categoria_gasto", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Gasto.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['ninguno', 'diario', 'semanal', 'mensual'], default: 'ninguno' }),
    __metadata("design:type", String)
], Gasto.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Gasto.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Gasto.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Gasto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Gasto.prototype, "dayOfMonth", void 0);
exports.Gasto = Gasto = __decorate([
    (0, typeorm_1.Entity)('expenses')
], Gasto);
//# sourceMappingURL=gasto.entity.js.map