"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const order_entity_1 = require("./entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const customer_entity_1 = require("../customer/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const mesa_entity_1 = require("../mesas/entities/mesa.entity");
const propina_entity_1 = require("../propina/entities/propina.entity");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order]), typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]), typeorm_1.TypeOrmModule.forFeature([propina_entity_1.Propina]), typeorm_1.TypeOrmModule.forFeature([customer_entity_1.Customer]), typeorm_1.TypeOrmModule.forFeature([product_entity_1.Product]),
            typeorm_1.TypeOrmModule.forFeature([mesa_entity_1.Mesa])
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map