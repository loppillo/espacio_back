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
exports.ThemeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const theme_entity_1 = require("./entities/theme.entity");
const orders_gateway_1 = require("../orders/orders.gateway");
let ThemeService = class ThemeService {
    constructor(repo, gateway) {
        this.repo = repo;
        this.gateway = gateway;
    }
    findAll() {
        return this.repo.find();
    }
    async findDefault() {
        const t = await this.repo.findOne({ where: { isDefault: true } });
        if (!t)
            throw new common_1.NotFoundException('No default theme set');
        return t;
    }
    async findOne(id) {
        const t = await this.repo.findOneBy({ id });
        if (!t)
            throw new common_1.NotFoundException('Theme not found');
        return t;
    }
    async create(data) {
        const theme = this.repo.create(data);
        const saved = await this.repo.save(theme);
        this.gateway.broadcast(saved);
        return saved;
    }
    async update(id, data) {
        await this.repo.update(id, data);
        const updated = await this.repo.findOneBy({ id });
        if (!updated)
            throw new common_1.NotFoundException('Theme not found');
        this.gateway.broadcast(updated);
        return updated;
    }
    async activate(id) {
        await this.repo.update({}, { isDefault: false });
        const theme = await this.repo.findOneBy({ id });
        if (!theme)
            throw new common_1.NotFoundException('Theme not found');
        theme.isDefault = true;
        const saved = await this.repo.save(theme);
        this.gateway.broadcast(saved);
        return saved;
    }
};
exports.ThemeService = ThemeService;
exports.ThemeService = ThemeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(theme_entity_1.Theme)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        orders_gateway_1.OrdersGateway])
], ThemeService);
//# sourceMappingURL=theme.service.js.map