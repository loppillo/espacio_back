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
exports.LightweightProductResponse = exports.LightweightProductDto = void 0;
const class_validator_1 = require("class-validator");
class LightweightProductDto {
}
exports.LightweightProductDto = LightweightProductDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], LightweightProductDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LightweightProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: 'El precio no puede ser negativo' }),
    __metadata("design:type", Number)
], LightweightProductDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LightweightProductDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], LightweightProductDto.prototype, "categoryIds", void 0);
class LightweightProductResponse {
}
exports.LightweightProductResponse = LightweightProductResponse;
//# sourceMappingURL=lightweight-product.dto.js.map