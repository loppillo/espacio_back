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
exports.HorariosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const horario_entity_1 = require("./entities/horario.entity");
let HorariosService = class HorariosService {
    constructor(horarioRepo) {
        this.horarioRepo = horarioRepo;
    }
    async create(dto) {
        const horario = this.horarioRepo.create(dto);
        return await this.horarioRepo.save(horario);
    }
    async findAll() {
        return await this.horarioRepo.find();
    }
    async findOne(id) {
        const horario = await this.horarioRepo.findOne({ where: { id } });
        if (!horario)
            throw new common_1.NotFoundException('Horario no encontrado');
        return horario;
    }
    async update(id, dto) {
        const result = await this.horarioRepo.update(id, dto);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Horario no encontrado');
        return this.findOne(id);
    }
    async remove(id) {
        const horario = await this.findOne(id);
        return await this.horarioRepo.remove(horario);
    }
    async getConfig() {
        const horarios = await this.horarioRepo.find();
        return horarios.reduce((acc, h) => {
            acc[h.seccion] = {
                enabled: h.enabled,
                hora_inicio: h.hora_inicio,
                hora_fin: h.hora_fin,
            };
            return acc;
        }, {});
    }
};
exports.HorariosService = HorariosService;
exports.HorariosService = HorariosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(horario_entity_1.Horario)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HorariosService);
//# sourceMappingURL=horarios.service.js.map