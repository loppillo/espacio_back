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
exports.ProductsOrdersController = void 0;
const common_1 = require("@nestjs/common");
const products_orders_service_1 = require("./products-orders.service");
const create_products_order_dto_1 = require("./dto/create-products-order.dto");
const update_products_order_dto_1 = require("./dto/update-products-order.dto");
let ProductsOrdersController = class ProductsOrdersController {
    constructor(productsOrdersService) {
        this.productsOrdersService = productsOrdersService;
    }
    create(createProductsOrderDto) {
        return this.productsOrdersService.create(createProductsOrderDto);
    }
    findAll() {
        return this.productsOrdersService.findAll();
    }
    findOne(id) {
        return this.productsOrdersService.findOne(+id);
    }
    update(id, updateProductsOrderDto) {
        return this.productsOrdersService.update(+id, updateProductsOrderDto);
    }
    remove(id) {
        return this.productsOrdersService.remove(+id);
    }
};
exports.ProductsOrdersController = ProductsOrdersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_products_order_dto_1.CreateProductsOrderDto]),
    __metadata("design:returntype", void 0)
], ProductsOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductsOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_products_order_dto_1.UpdateProductsOrderDto]),
    __metadata("design:returntype", void 0)
], ProductsOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsOrdersController.prototype, "remove", null);
exports.ProductsOrdersController = ProductsOrdersController = __decorate([
    (0, common_1.Controller)('products-orders'),
    __metadata("design:paramtypes", [products_orders_service_1.ProductsOrdersService])
], ProductsOrdersController);
//# sourceMappingURL=products-orders.controller.js.map