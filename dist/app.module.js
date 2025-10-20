"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const categories_module_1 = require("./categories/categories.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const propina_module_1 = require("./propina/propina.module");
const typeorm_1 = require("@nestjs/typeorm");
const customer_module_1 = require("./customer/customer.module");
const mesas_module_1 = require("./mesas/mesas.module");
const gastos_module_1 = require("./gastos/gastos.module");
const categoria_gasto_module_1 = require("./categoria-gasto/categoria-gasto.module");
const auth_module_1 = require("./auth/auth/auth.module");
const products_orders_module_1 = require("./products-orders/products-orders.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'usuario_node',
                password: 'siQA8Ew(wbaGEs',
                database: 'pub_app',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
            }),
            users_module_1.UsersModule, categories_module_1.CategoriesModule, gastos_module_1.GastosModule, products_module_1.ProductsModule, orders_module_1.OrdersModule, propina_module_1.PropinaModule, customer_module_1.CustomerModule, mesas_module_1.MesasModule, gastos_module_1.GastosModule, categoria_gasto_module_1.CategoriaGastoModule, auth_module_1.AuthModule, products_orders_module_1.ProductsOrdersModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map