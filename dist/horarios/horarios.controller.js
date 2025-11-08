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
exports.HorariosController = void 0;
const common_1 = require("@nestjs/common");
const horarios_service_1 = require("./horarios.service");
const create_horario_dto_1 = require("./dto/create-horario.dto");
const update_horario_dto_1 = require("./dto/update-horario.dto");
let HorariosController = class HorariosController {
    constructor(horariosService) {
        this.horariosService = horariosService;
    }
    create(createHorarioDto) {
        return this.horariosService.create(createHorarioDto);
    }
    findAll() {
        return this.horariosService.findAll();
    }
    getConfig() {
        return this.horariosService.getConfig();
    }
    findOne(id) {
        return this.horariosService.findOne(id);
    }
    update(id, updateHorarioDto) {
        return this.horariosService.update(id, updateHorarioDto);
    }
    remove(id) {
        return this.horariosService.remove(id);
    }
};
exports.HorariosController = HorariosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_horario_dto_1.CreateHorarioDto]),
    __metadata("design:returntype", void 0)
], HorariosController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HorariosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HorariosController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HorariosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_horario_dto_1.UpdateHorarioDto]),
    __metadata("design:returntype", void 0)
], HorariosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HorariosController.prototype, "remove", null);
exports.HorariosController = HorariosController = __decorate([
    (0, common_1.Controller)('horarios'),
    __metadata("design:paramtypes", [horarios_service_1.HorariosService])
], HorariosController);
//# sourceMappingURL=horarios.controller.js.map