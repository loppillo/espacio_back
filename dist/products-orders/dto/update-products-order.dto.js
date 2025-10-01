"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductsOrderDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_products_order_dto_1 = require("./create-products-order.dto");
class UpdateProductsOrderDto extends (0, mapped_types_1.PartialType)(create_products_order_dto_1.CreateProductsOrderDto) {
}
exports.UpdateProductsOrderDto = UpdateProductsOrderDto;
//# sourceMappingURL=update-products-order.dto.js.map