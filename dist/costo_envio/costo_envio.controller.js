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
exports.CostoEnvioController = void 0;
const common_1 = require("@nestjs/common");
const costo_envio_service_1 = require("./costo_envio.service");
const create_costo_envio_dto_1 = require("./dto/create-costo_envio.dto");
const update_costo_envio_dto_1 = require("./dto/update-costo_envio.dto");
let CostoEnvioController = class CostoEnvioController {
    constructor(costoEnvioService) {
        this.costoEnvioService = costoEnvioService;
    }
    findAll() {
        return this.costoEnvioService.findAll();
    }
    create(createCostoEnvioDto) {
        return this.costoEnvioService.create(createCostoEnvioDto);
    }
    findOne(id) {
        return this.costoEnvioService.findOne(+id);
    }
    update(id, updateCostoEnvioDto) {
        return this.costoEnvioService.update(+id, updateCostoEnvioDto);
    }
    remove(id) {
        return this.costoEnvioService.remove(+id);
    }
};
exports.CostoEnvioController = CostoEnvioController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CostoEnvioController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_costo_envio_dto_1.CreateCostoEnvioDto]),
    __metadata("design:returntype", void 0)
], CostoEnvioController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CostoEnvioController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_costo_envio_dto_1.UpdateCostoEnvioDto]),
    __metadata("design:returntype", void 0)
], CostoEnvioController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CostoEnvioController.prototype, "remove", null);
exports.CostoEnvioController = CostoEnvioController = __decorate([
    (0, common_1.Controller)('costo-envio'),
    __metadata("design:paramtypes", [costo_envio_service_1.CostoEnvioService])
], CostoEnvioController);
//# sourceMappingURL=costo_envio.controller.js.map