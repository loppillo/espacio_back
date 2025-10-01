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
exports.PropinaService = void 0;
const common_1 = require("@nestjs/common");
const propina_entity_1 = require("./entities/propina.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
let PropinaService = class PropinaService {
    constructor(orderRepository, propinaRepository) {
        this.orderRepository = orderRepository;
        this.propinaRepository = propinaRepository;
    }
    async create(createPropinaDto) {
        const orderId = await this.orderRepository.findOneBy({
            id: createPropinaDto.orderId,
        });
        if (!orderId) {
            throw new common_1.BadRequestException('la categoria no se encuentra');
        }
        return await this.propinaRepository.save({
            ...createPropinaDto,
            amount: createPropinaDto.amount,
            orderId: orderId
        });
    }
    async findAll() {
        return await this.propinaRepository.find();
    }
    async findOne(id) {
        return await this.propinaRepository.findOneBy({ id });
    }
    async update(id, updatePropinaDto) {
        return await this.propinaRepository.update(id, updatePropinaDto);
    }
    async remove(id) {
        return await this.propinaRepository.delete(id);
    }
};
exports.PropinaService = PropinaService;
exports.PropinaService = PropinaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(propina_entity_1.Propina)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PropinaService);
//# sourceMappingURL=propina.service.js.map