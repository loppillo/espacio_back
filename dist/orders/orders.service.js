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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const order_entity_1 = require("./entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const customer_entity_1 = require("../customer/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const propina_entity_1 = require("../propina/entities/propina.entity");
const mesa_entity_1 = require("../mesas/entities/mesa.entity");
const products_order_entity_1 = require("../products-orders/entities/products-order.entity");
let OrdersService = class OrdersService {
    constructor(orderRepository, userRepository, customerRepository, productRepository, propinaRepository, mesaRepository, productsOrdersRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.propinaRepository = propinaRepository;
        this.mesaRepository = mesaRepository;
        this.productsOrdersRepository = productsOrdersRepository;
    }
    async create(createOrderDto) {
        const { products, propina, mesaId } = createOrderDto;
        let mesa = null;
        if (mesaId) {
            mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
            if (!mesa) {
                throw new common_1.BadRequestException('La mesa no se encuentra');
            }
        }
        const lastOrder = await this.orderRepository.findOne({
            where: {},
            order: { id: 'DESC' },
        });
        const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;
        const newOrder = this.orderRepository.create({
            detalle_venta: createOrderDto.detalle_venta,
            tableNumber: createOrderDto.tableNumber,
            propina,
            status: createOrderDto.status,
            orderType: createOrderDto.orderType,
            paymentMethod: createOrderDto.paymentMethod,
            mesa,
            numeroVenta: nextNumeroVenta,
            total: 0,
        });
        newOrder.orderProducts = [];
        let total = 0;
        for (const p of products) {
            const productEntity = await this.productRepository.findOne({ where: { id: p.id } });
            if (!productEntity) {
                throw new common_1.BadRequestException(`Producto con id ${p.id} no encontrado`);
            }
            const subtotal = productEntity.price * p.cantidad;
            total += subtotal;
            const orderProduct = new products_order_entity_1.ProductsOrders();
            orderProduct.product = productEntity;
            orderProduct.cantidad = p.cantidad;
            orderProduct.precioUnitario = productEntity.price;
            orderProduct.subtotal = subtotal;
            newOrder.orderProducts.push(orderProduct);
        }
        newOrder.total = total + (propina || 0);
        return await this.orderRepository.save(newOrder);
    }
    async creates(createOrderDto) {
        const { products, customerId, newCustomer, propina } = createOrderDto;
        let customer = null;
        if (customerId) {
            customer = await this.customerRepository.findOneBy({ id: customerId });
            if (!customer)
                throw new common_1.BadRequestException('El cliente no se encuentra');
        }
        else if (newCustomer) {
            if (!newCustomer.customerName) {
                throw new common_1.BadRequestException('El nombre del cliente es obligatorio');
            }
            customer = this.customerRepository.create({
                customerName: newCustomer.customerName,
                customerEmail: newCustomer.customerEmail || '',
                customerAddress: newCustomer.customerAddress || '',
                customerPhone: newCustomer.customerPhone || '',
            });
            await this.customerRepository.save(customer);
        }
        const productIds = products.map(p => p.id);
        const foundProducts = await this.productRepository.findBy({ id: (0, typeorm_1.In)(productIds) });
        if (foundProducts.length !== productIds.length) {
            throw new common_1.BadRequestException('Uno o más productos no se encuentran');
        }
        const lastOrder = await this.orderRepository.findOne({
            where: {},
            order: { id: 'DESC' },
        });
        const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;
        const newOrder = this.orderRepository.create({
            detalle_venta: createOrderDto.detalle_venta,
            status: createOrderDto.status || 'activo',
            orderType: createOrderDto.orderType || 'local',
            paymentMethod: createOrderDto.paymentMethod || 'pendiente',
            createdAt: new Date(),
            customer,
            propina: propina ?? 0,
            numeroVenta: nextNumeroVenta,
            orderProducts: [],
        });
        let total = 0;
        for (const p of products) {
            const productEntity = foundProducts.find(fp => fp.id === p.id);
            if (!productEntity) {
                throw new common_1.BadRequestException(`Producto con id ${p.id} no encontrado`);
            }
            const subtotal = productEntity.price * p.cantidad;
            total += subtotal;
            const orderProduct = new products_order_entity_1.ProductsOrders();
            orderProduct.product = productEntity;
            orderProduct.cantidad = p.cantidad;
            orderProduct.precioUnitario = productEntity.price;
            orderProduct.subtotal = subtotal;
            newOrder.orderProducts.push(orderProduct);
        }
        newOrder.total = total + (propina || 0);
        return await this.orderRepository.save(newOrder);
    }
    async findAll() {
        return await this.orderRepository.find();
    }
    async findOne(id) {
        return await this.orderRepository.findOneBy({ id });
    }
    async update(id, updateOrderDto) {
        return await this.orderRepository.update(id, updateOrderDto);
    }
    async remove(id) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException(`La orden con ID ${id} no existe`);
        }
        await this.orderRepository.softRemove(order);
        return { message: 'Orden eliminada correctamente', id };
    }
    async cancelarOrden(id) {
        const orden = await this.orderRepository.findOneBy({ id });
        if (!orden)
            throw new common_1.NotFoundException('Orden no encontrada');
        orden.status = 'cancelado';
        return this.orderRepository.save(orden);
    }
    async getProductosPorMesa(mesaId) {
        const orders = await this.orderRepository.find({
            where: { mesa: { id: mesaId }, estado: 'activo' },
            relations: ['orderProducts', 'orderProducts.product'],
        });
        if (!orders.length) {
            throw new common_1.NotFoundException('No se encontraron órdenes para esta mesa');
        }
        const productos = orders.flatMap(order => order.orderProducts.map(op => ({
            orderId: order.id,
            productoId: op.product.id,
            nombre: op.product.name,
            precio: op.product.price,
            cantidad: op.cantidad,
        })));
        return productos;
    }
    async eliminarProducto(orderId, productId) {
        const orderProduct = await this.productsOrdersRepository.findOne({
            where: { orderId, productId },
            relations: ['product', 'order'],
        });
        if (!orderProduct) {
            throw new common_1.NotFoundException('El producto no está en la orden');
        }
        await this.productsOrdersRepository.delete({ orderId, productId });
        const remainingProducts = await this.productsOrdersRepository.find({
            where: { orderId },
        });
        const newTotal = remainingProducts.reduce((sum, op) => sum + op.subtotal, 0);
        const updatedOrder = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['orderProducts'],
        });
        updatedOrder.total = newTotal;
        if (remainingProducts.length === 0) {
            updatedOrder.status = 'vacío';
            updatedOrder.propina = 0;
        }
        await this.orderRepository.save(updatedOrder);
        return updatedOrder;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_2.InjectRepository)(customer_entity_1.Customer)),
    __param(3, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(4, (0, typeorm_2.InjectRepository)(propina_entity_1.Propina)),
    __param(5, (0, typeorm_2.InjectRepository)(mesa_entity_1.Mesa)),
    __param(6, (0, typeorm_2.InjectRepository)(products_order_entity_1.ProductsOrders)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map