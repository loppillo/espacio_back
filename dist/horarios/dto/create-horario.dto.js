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
exports.CreateHorarioDto = void 0;
const class_validator_1 = require("class-validator");
class CreateHorarioDto {
}
exports.CreateHorarioDto = CreateHorarioDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHorarioDto.prototype, "seccion", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'Hora inválida' }),
    __metadata("design:type", String)
], CreateHorarioDto.prototype, "hora_inicio", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1]\d|2[0-3]):[0-5]\d$/, { message: 'Hora inválida' }),
    __metadata("design:type", String)
], CreateHorarioDto.prototype, "hora_fin", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHorarioDto.prototype, "enabled", void 0);
//# sourceMappingURL=create-horario.dto.js.map