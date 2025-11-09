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
exports.Theme = void 0;
const typeorm_1 = require("typeorm");
let Theme = class Theme {
};
exports.Theme = Theme;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Theme.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Theme.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#6C5CE7' }),
    __metadata("design:type", String)
], Theme.prototype, "primaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#00CEC9' }),
    __metadata("design:type", String)
], Theme.prototype, "secondaryColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '#ffffff' }),
    __metadata("design:type", String)
], Theme.prototype, "backgroundColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'light' }),
    __metadata("design:type", String)
], Theme.prototype, "mode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Theme.prototype, "isDefault", void 0);
exports.Theme = Theme = __decorate([
    (0, typeorm_1.Entity)()
], Theme);
//# sourceMappingURL=theme.entity.js.map