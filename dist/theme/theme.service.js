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
let ThemeService = class ThemeService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const preset = this.repo.create(dto);
        return this.repo.save(preset);
    }
    async findAll() {
        return this.repo.find();
    }
    async findOne(id) {
        const preset = await this.repo.findOne({ where: { id } });
        if (!preset)
            throw new common_1.NotFoundException('Preset no existe.');
        return preset;
    }
    async update(id, dto) {
        const preset = await this.findOne(id);
        if (dto.isDefault) {
            await this.repo.update({ isDefault: true }, { isDefault: false });
        }
        Object.assign(preset, dto);
        return this.repo.save(preset);
    }
    async remove(id) {
        const preset = await this.findOne(id);
        return this.repo.remove(preset);
    }
    async getDefaultPreset() {
        let preset = await this.repo.findOne({ where: { isDefault: true } });
        if (!preset) {
            preset = this.repo.create({
                name: 'Default',
                isDefault: true,
            });
            await this.repo.save(preset);
        }
        return preset;
    }
};
exports.ThemeService = ThemeService;
exports.ThemeService = ThemeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(theme_entity_1.Theme)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ThemeService);
//# sourceMappingURL=theme.service.js.map