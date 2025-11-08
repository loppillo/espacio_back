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
exports.CategoriaGastoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const categoria_gasto_entity_1 = require("./entities/categoria-gasto.entity");
let CategoriaGastoService = class CategoriaGastoService {
    constructor(categoriaGastoRepository) {
        this.categoriaGastoRepository = categoriaGastoRepository;
    }
    create(createCategoriaGastoDto) {
        const categoria = this.categoriaGastoRepository.create(createCategoriaGastoDto);
        return this.categoriaGastoRepository.save(categoria);
    }
    findAll() {
        return this.categoriaGastoRepository.find();
    }
    findOne(id) {
        return this.categoriaGastoRepository.findOne({ where: { id } });
    }
    async update(id, updateCategoriaGastoDto) {
        await this.categoriaGastoRepository.update(id, updateCategoriaGastoDto);
        return this.findOne(id);
    }
    remove(id) {
        return this.categoriaGastoRepository.delete(id);
    }
};
exports.CategoriaGastoService = CategoriaGastoService;
exports.CategoriaGastoService = CategoriaGastoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(categoria_gasto_entity_1.CategoriaGasto)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriaGastoService);
//# sourceMappingURL=categoria-gasto.service.js.map