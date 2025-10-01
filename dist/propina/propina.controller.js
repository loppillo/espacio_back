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
exports.PropinaController = void 0;
const common_1 = require("@nestjs/common");
const propina_service_1 = require("./propina.service");
const create_propina_dto_1 = require("./dto/create-propina.dto");
const update_propina_dto_1 = require("./dto/update-propina.dto");
let PropinaController = class PropinaController {
    constructor(propinaService) {
        this.propinaService = propinaService;
    }
    create(createPropinaDto) {
        return this.propinaService.create(createPropinaDto);
    }
    findAll() {
        return this.propinaService.findAll();
    }
    findOne(id) {
        return this.propinaService.findOne(+id);
    }
    update(id, updatePropinaDto) {
        return this.propinaService.update(+id, updatePropinaDto);
    }
    remove(id) {
        return this.propinaService.remove(+id);
    }
};
exports.PropinaController = PropinaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_propina_dto_1.CreatePropinaDto]),
    __metadata("design:returntype", void 0)
], PropinaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PropinaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropinaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_propina_dto_1.UpdatePropinaDto]),
    __metadata("design:returntype", void 0)
], PropinaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PropinaController.prototype, "remove", null);
exports.PropinaController = PropinaController = __decorate([
    (0, common_1.Controller)('propina'),
    __metadata("design:paramtypes", [propina_service_1.PropinaService])
], PropinaController);
//# sourceMappingURL=propina.controller.js.map