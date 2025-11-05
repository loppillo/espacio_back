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
const orders_gateway_1 = require("./orders.gateway");
let OrdersService = class OrdersService {
    constructor(dataSource, orderRepository, userRepository, customerRepository, productRepository, propinaRepository, mesaRepository, productsOrdersRepository, ordersGateway) {
        this.dataSource = dataSource;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.propinaRepository = propinaRepository;
        this.mesaRepository = mesaRepository;
        this.productsOrdersRepository = productsOrdersRepository;
        this.ordersGateway = ordersGateway;
    }
    async create(createOrderDto) {
        const { products, propina, mesaId, orderType } = createOrderDto;
        const mesa = await this.mesaRepository.findOne({ where: { id: Number(mesaId) } });
        if (!mesa)
            throw new common_1.BadRequestException('La mesa no existe');
        const newOrder = this.orderRepository.create({
            tableNumber: Number(mesa.numero_mesa),
            orderType,
            estado: 'activo',
            status: 'pendiente',
            propina,
            total: 0,
            paymentMethod: 'pendiente',
            numeroVenta: await this.generarNumeroVenta(),
            mesa,
        });
        const savedOrder = await this.orderRepository.save(newOrder);
        const orderProducts = [];
        let total = 0;
        for (const item of products) {
            const product = await this.productRepository.findOne({ where: { id: item.id } });
            if (!product)
                continue;
            const subtotal = product.price * item.cantidad;
            total += subtotal;
            orderProducts.push(this.productsOrdersRepository.create({
                order: savedOrder,
                product,
                cantidad: item.cantidad,
                precioUnitario: product.price,
                subtotal,
            }));
        }
        await this.productsOrdersRepository.save(orderProducts);
        savedOrder.total = total + (propina || 0);
        await this.orderRepository.save(savedOrder);
        mesa.status = 'ocupada';
        await this.mesaRepository.save(mesa);
        const fullOrder = await this.orderRepository.findOne({
            where: { id: savedOrder.id },
            relations: {
                customer: true,
                orderProducts: { product: true },
            },
        });
        fullOrder.mesa = mesa;
        Promise.resolve().then(() => {
            this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
            this.ordersGateway.notifyNewOrder(this.ordersGateway.sanitizeOrder(fullOrder));
        });
        return fullOrder;
    }
    async creates(createOrderDto) {
        const { products, propina = 0, orderType = 'delivery' } = createOrderDto;
        if (orderType !== 'delivery') {
            throw new common_1.BadRequestException('Este método solo permite pedidos de delivery.');
        }
        const { max } = await this.orderRepository
            .createQueryBuilder('order')
            .select('MAX(order.numeroVenta)', 'max')
            .getRawOne();
        const nextNumeroVenta = (max || 0) + 1;
        const newOrder = this.orderRepository.create({
            detalle_venta: createOrderDto.detalle_venta,
            propina,
            status: createOrderDto.status || 'pendiente',
            orderType,
            paymentMethod: createOrderDto.paymentMethod || 'pendiente',
            numeroVenta: nextNumeroVenta,
            total: 0,
        });
        const productIds = products.map(p => p.id);
        const productEntities = await this.productRepository.findBy({ id: (0, typeorm_1.In)(productIds) });
        if (productEntities.length !== products.length) {
            throw new common_1.BadRequestException('Uno o más productos no existen');
        }
        let total = 0;
        const orderProducts = products.map(p => {
            const productEntity = productEntities.find(pe => pe.id === p.id);
            const subtotal = productEntity.price * p.cantidad;
            total += subtotal;
            const op = new products_order_entity_1.ProductsOrders();
            op.product = productEntity;
            op.cantidad = p.cantidad;
            op.precioUnitario = productEntity.price;
            op.subtotal = subtotal;
            op.order = newOrder;
            return op;
        });
        newOrder.total = total + propina;
        newOrder.orderProducts = orderProducts;
        const savedOrder = await this.orderRepository.save(newOrder);
        const fullOrder = await this.orderRepository.findOne({
            where: { id: savedOrder.id },
            relations: ['customer', 'orderProducts', 'orderProducts.product'],
        });
        const sanitized = this.sanitizeOrder(fullOrder);
        Promise.resolve().then(() => {
            this.ordersGateway.notifyNewOrder(sanitized);
        });
        return sanitized;
    }
    async findAll() {
        return await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.orderProducts', 'orderProducts')
            .leftJoinAndSelect('orderProducts.product', 'product')
            .orderBy('product.price', 'ASC')
            .getMany();
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
    async getHistorialPorMesa(mesaId) {
        const pedidos = await this.orderRepository.find({
            where: { mesaId },
            relations: ['orderProducts', 'orderProducts.product'],
            order: { createdAt: 'DESC' },
        });
        if (!pedidos.length) {
            console.warn('⚠️ No se encontraron pedidos para la mesa', mesaId);
            return [];
        }
        return pedidos.map(pedido => {
            const totalProductos = pedido.orderProducts.reduce((sum, op) => sum + op.subtotal, 0);
            return {
                numeroVenta: pedido.numeroVenta,
                mesaId: pedido.mesaId,
                status: pedido.status,
                estado: pedido.estado,
                createdAt: pedido.createdAt,
                propina: pedido.propina,
                totalProductos,
                totalPedido: totalProductos + (pedido.propina || 0),
                products: pedido.orderProducts.map(op => ({
                    id: op.product.id,
                    nombre: op.product.name,
                    cantidad: op.cantidad,
                    precio: op.precioUnitario,
                    subtotal: op.subtotal,
                })),
            };
        });
    }
    async obtenerPendientes() {
        return await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.mesa', 'mesa')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.orderProducts', 'orderProducts')
            .leftJoinAndSelect('orderProducts.product', 'product')
            .where('order.status = :status', { status: 'pendiente' })
            .orderBy('order.createdAt', 'ASC')
            .getMany();
    }
    async aceptarVenta(orderId) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['mesa']
        });
        if (!order)
            throw new common_1.NotFoundException('Pedido no encontrado');
        order.status = 'Pagado';
        await this.orderRepository.save(order);
        const mesa = order.mesa;
        if (mesa) {
            const pedidosActivos = await this.orderRepository.count({
                where: { mesaId: mesa.id, status: 'Activo' }
            });
            mesa.status = pedidosActivos > 0 ? 'Ocupada' : 'Libre';
            await this.mesaRepository.save(mesa);
            this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
        }
        return order;
    }
    async cancelarVenta(orderId) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['mesa'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Pedido no encontrado');
        }
        order.status = 'Cancelado';
        await this.orderRepository.save(order);
        if (order.mesa) {
            order.mesa.status = 'Disponible';
            await this.mesaRepository.save(order.mesa);
        }
        return order;
    }
    async getVentasDiarias(desde, hasta, orderType) {
        let inicio;
        let fin;
        if (!desde && !hasta) {
            const hoy = new Date();
            inicio = new Date(hoy.setHours(0, 0, 0, 0));
            fin = new Date(hoy.setHours(23, 59, 59, 999));
        }
        else {
            inicio = new Date(desde);
            fin = new Date(hasta);
        }
        const totalesQuery = this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.total)', 'total_ventas')
            .addSelect('COUNT(order.id)', 'cantidad_pedidos')
            .where('order.status = :status', { status: 'Pagado' })
            .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });
        if (orderType) {
            totalesQuery.andWhere('order.orderType = :orderType', { orderType });
        }
        const totales = await totalesQuery.getRawOne();
        const graficoQuery = this.orderRepository
            .createQueryBuilder('order')
            .select("DATE_FORMAT(order.createdAt, '%H:00')", 'hora')
            .addSelect('SUM(order.total)', 'total')
            .where('order.status = :status', { status: 'Pagado' })
            .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin })
            .groupBy('hora')
            .orderBy('hora', 'ASC');
        if (orderType) {
            graficoQuery.andWhere('order.orderType = :orderType', { orderType });
        }
        const grafico = await graficoQuery.getRawMany();
        const detallesQuery = this.orderRepository
            .createQueryBuilder('order')
            .select([
            'order.id AS id',
            'order.total AS total',
            'order.orderType AS orderType',
            'order.paymentMethod AS paymentMethod',
            'order.createdAt AS createdAt',
            'mesa.numero_mesa AS numero_mesa',
        ])
            .leftJoin('order.mesa', 'mesa')
            .where('order.status = :status', { status: 'Pagado' })
            .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin })
            .orderBy('order.createdAt', 'DESC');
        if (orderType) {
            detallesQuery.andWhere('order.orderType = :orderType', { orderType });
        }
        const detalles = await detallesQuery.getRawMany();
        return {
            totalVentas: Number(totales?.total_ventas || 0),
            cantidadPedidos: Number(totales?.cantidad_pedidos || 0),
            rango: { desde: inicio, hasta: fin },
            grafico,
            detalles,
        };
    }
    async getVentasDiariasxMesa(desde, hasta, mesaId) {
        let inicio;
        let fin;
        if (!desde && !hasta) {
            const hoy = new Date();
            inicio = new Date(hoy.setHours(0, 0, 0, 0));
            fin = new Date(hoy.setHours(23, 59, 59, 999));
        }
        else {
            inicio = new Date(desde);
            fin = new Date(hasta);
        }
        const query = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.mesa', 'mesa')
            .where('order.status = :status', { status: 'Pagado' })
            .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });
        if (mesaId)
            query.andWhere('order.mesaId = :mesaId', { mesaId });
        const ventas = await query
            .select([
            'order.id AS id',
            'order.total AS total',
            'order.orderType AS tipo',
            'order.paymentMethod AS metodo',
            'mesa.numero_mesa AS mesa',
            'order.createdAt AS fecha',
        ])
            .orderBy('order.createdAt', 'DESC')
            .getRawMany();
        return ventas;
    }
    async cancelarVentas(fecha, mesaId) {
        const query = this.orderRepository.createQueryBuilder('order')
            .update()
            .set({ status: 'Cancelado' });
        if (fecha) {
            const inicio = new Date(`${fecha}T00:00:00`);
            const fin = new Date(`${fecha}T23:59:59`);
            query.where('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });
        }
        if (mesaId) {
            if (fecha) {
                query.andWhere('order.mesaId = :mesaId', { mesaId });
            }
            else {
                query.where('order.mesaId = :mesaId', { mesaId });
            }
        }
        const result = await query.execute();
        return {
            message: 'Ventas canceladas correctamente',
            afectadas: result.affected,
        };
    }
    async cancelar(id) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('La venta no existe');
        }
        if (order.status === 'Cancelado') {
            throw new common_1.BadRequestException('La venta ya está cancelada');
        }
        order.status = 'Cancelado';
        await this.orderRepository.save(order);
        return { message: `Venta ${id} cancelada correctamente` };
    }
    sanitizeOrder(order) {
        if (!order)
            return null;
        return {
            id: order.id,
            tableNumber: order.tableNumber ?? null,
            orderType: order.orderType ?? 'local',
            detalle_venta: order.detalle_venta ?? null,
            estado: order.estado ?? 'activo',
            propina: order.propina ?? 0,
            status: order.status ?? 'pendiente',
            total: order.total ?? 0,
            createdAt: order.createdAt ?? new Date(),
            paymentMethod: order.paymentMethod ?? 'pendiente',
            numeroVenta: order.numeroVenta ?? null,
            mesaId: order.mesa?.id ?? null,
            mesa: order.mesa
                ? {
                    id: order.mesa.id,
                    numero_mesa: order.mesa.numero_mesa,
                    status: order.mesa.status,
                }
                : null,
            customer: order.customer
                ? {
                    id: order.customer.id,
                    name: order.customer.customerName,
                    email: order.customer.customerEmail,
                    phone: order.customer.customerPhone,
                }
                : null,
            orderProducts: order.orderProducts?.map(op => ({
                orderId: op.order?.id ?? order.id,
                productId: op.product?.id ?? null,
                cantidad: op.cantidad,
                precioUnitario: op.precioUnitario,
                subtotal: op.subtotal,
                product: op.product
                    ? {
                        id: op.product.id,
                        name: op.product.name,
                        description: op.product.description,
                        price: op.product.price,
                        imageUrl: op.product.imageUrl ?? null,
                    }
                    : null,
            })) ?? [],
        };
    }
    async generarNumeroVenta() {
        const { max } = await this.orderRepository
            .createQueryBuilder('order')
            .select('MAX(order.numeroVenta)', 'max')
            .getRawOne();
        return (max || 0) + 1;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __param(1, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_2.InjectRepository)(customer_entity_1.Customer)),
    __param(4, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(5, (0, typeorm_2.InjectRepository)(propina_entity_1.Propina)),
    __param(6, (0, typeorm_2.InjectRepository)(mesa_entity_1.Mesa)),
    __param(7, (0, typeorm_2.InjectRepository)(products_order_entity_1.ProductsOrders)),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        orders_gateway_1.OrdersGateway])
], OrdersService);
//# sourceMappingURL=orders.service.js.map