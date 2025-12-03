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
exports.CostoEnvioService = void 0;
const common_1 = require("@nestjs/common");
const costo_envio_entity_1 = require("./entities/costo_envio.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let CostoEnvioService = class CostoEnvioService {
    constructor(costoEnvioRepository) {
        this.costoEnvioRepository = costoEnvioRepository;
    }
    async create(createCostoEnvioDto) {
        const costoEnvio = this.costoEnvioRepository.create(createCostoEnvioDto);
        return await this.costoEnvioRepository.save(costoEnvio);
    }
    async findAll() {
        return await this.costoEnvioRepository.find({
            order: { id: 'DESC' },
        });
    }
    async findOne(id) {
        return await this.costoEnvioRepository.findOne({ where: { id } });
    }
    async update(id, updateCostoEnvioDto) {
        await this.costoEnvioRepository.update(id, updateCostoEnvioDto);
        return await this.costoEnvioRepository.findOne({ where: { id } });
    }
    async remove(id) {
        await this.costoEnvioRepository.delete(id);
        return { message: `Costo de envío con ID ${id} eliminado correctamente` };
    }
};
exports.CostoEnvioService = CostoEnvioService;
exports.CostoEnvioService = CostoEnvioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(costo_envio_entity_1.CostoEnvio)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CostoEnvioService);
//# sourceMappingURL=costo_envio.service.js.map