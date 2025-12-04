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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const order_entity_1 = require("./entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const customer_entity_1 = require("../customer/entities/customer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const mesa_entity_1 = require("../mesas/entities/mesa.entity");
const products_order_entity_1 = require("../products-orders/entities/products-order.entity");
const orders_gateway_1 = require("./orders.gateway");
const mail_service_1 = require("../mail/mail.service");
const costo_envio_entity_1 = require("../costo_envio/entities/costo_envio.entity");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(dataSource, orderRepository, userRepository, customerRepository, productRepository, mesaRepository, productsOrdersRepository, costoEnvioRepository, ordersGateway, mailService) {
        this.dataSource = dataSource;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.mesaRepository = mesaRepository;
        this.productsOrdersRepository = productsOrdersRepository;
        this.costoEnvioRepository = costoEnvioRepository;
        this.ordersGateway = ordersGateway;
        this.mailService = mailService;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async update(id, dto) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['orderProducts', 'orderProducts.product', 'customer', 'mesa'],
        });
        if (!order)
            throw new common_1.NotFoundException('Orden no encontrada');
        const subtotal = order.orderProducts.reduce((acc, op) => acc + op.subtotal, 0);
        let nuevaPropina = order.propina;
        if (dto.propinaTipo !== undefined) {
            switch (dto.propinaTipo) {
                case '5':
                    nuevaPropina = Math.round(subtotal * 0.05);
                    break;
                case '10':
                    nuevaPropina = Math.round(subtotal * 0.10);
                    break;
                case '12':
                    nuevaPropina = Math.round(subtotal * 0.12);
                    break;
                case 'custom':
                    nuevaPropina = dto.propinaValor ?? 0;
                    break;
                case 'none':
                    nuevaPropina = 0;
                    break;
            }
        }
        order.propina = nuevaPropina;
        order.total = subtotal + nuevaPropina;
        const camposValidos = [
            'tableNumber',
            'orderType',
            'status',
            'userId',
            'customerId',
        ];
        for (const campo of camposValidos) {
            if (dto[campo] !== undefined) {
                order[campo] = dto[campo];
            }
        }
        await this.orderRepository.save({
            id: order.id,
            propina: order.propina,
            total: order.total,
            tableNumber: order.tableNumber,
            orderType: order.orderType,
            status: order.status,
        });
        this.ordersGateway.notifyOrderUpdated(order);
        return this.orderRepository.findOne({
            where: { id },
            relations: ['orderProducts', 'orderProducts.product', 'customer', 'mesa'],
        });
    }
    async create(createOrderDto) {
        const { products, propina = 0, mesaId, orderType = 'local' } = createOrderDto;
        const mesa = await this.mesaRepository.findOne({ where: { id: Number(mesaId) } });
        if (!mesa)
            throw new common_1.BadRequestException('La mesa no existe');
        const tableNumber = parseInt(String(mesa.numero_mesa).replace(/\D/g, ''), 10) || 0;
        const safePropina = Number(propina) || 0;
        const numeroVenta = await this.generarNumeroVenta();
        if (!products || products.length === 0) {
            throw new common_1.BadRequestException('El pedido debe tener productos');
        }
        const productIds = products.map(p => p.id);
        const productEntities = await this.productRepository.findBy({ id: (0, typeorm_1.In)(productIds) });
        if (productEntities.length !== products.length) {
            throw new common_1.BadRequestException('Uno o más productos no existen');
        }
        let total = 0;
        const orderProductsData = products.map(p => {
            const productEntity = productEntities.find(pe => pe.id === p.id);
            const price = Number(productEntity.price) || 0;
            const cantidad = Number(p.cantidad) || 0;
            const subtotal = price * cantidad;
            total += subtotal;
            return {
                productId: productEntity.id,
                cantidad,
                precioUnitario: price,
                subtotal,
            };
        });
        const safeTotal = (Number(total) || 0) + safePropina;
        const newOrder = this.orderRepository.create({
            tableNumber,
            orderType,
            estado: 'activo',
            status: 'pendiente',
            paymentMethod: '',
            propina: safePropina,
            total: safeTotal,
            numeroVenta,
            mesa,
            detalle_venta: createOrderDto.detalle_venta || null,
        });
        const savedOrder = await this.orderRepository.save(newOrder);
        const orderProducts = orderProductsData.map(op => this.productsOrdersRepository.create({
            orderId: savedOrder.id,
            ...op,
        }));
        await this.productsOrdersRepository.save(orderProducts);
        mesa.status = 'ocupada';
        await this.mesaRepository.save(mesa);
        const fullOrder = await this.orderRepository.findOne({
            where: { id: savedOrder.id },
            relations: ['customer', 'orderProducts', 'orderProducts.product', 'mesa'],
        });
        const sanitized = this.sanitizeOrder(fullOrder);
        Promise.resolve().then(() => {
            this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
            this.ordersGateway.notifyNewOrder(sanitized);
        });
        return sanitized;
    }
    async creates(createOrderDto) {
        const { products = [], orderType = 'delivery' } = createOrderDto;
        if (orderType !== 'delivery') {
            throw new common_1.BadRequestException('Este método solo permite pedidos de delivery.');
        }
        let customer = null;
        if (createOrderDto.customerId) {
            customer = await this.customerRepository.findOne({
                where: { id: createOrderDto.customerId }
            });
            if (!customer)
                throw new common_1.NotFoundException('Cliente no encontrado');
        }
        if (!customer && createOrderDto.newCustomer) {
            const nc = createOrderDto.newCustomer;
            customer = await this.customerRepository.save(this.customerRepository.create({
                customerName: nc.customerName,
                customerEmail: nc.customerEmail || null,
                customerAddress: nc.customerAddress || null,
                customerPhone: nc.customerPhone || null,
            }));
        }
        if (!customer) {
            throw new common_1.BadRequestException('Debe proporcionar customerId o newCustomer');
        }
        const { max } = await this.orderRepository
            .createQueryBuilder('order')
            .select('MAX(order.numeroVenta)', 'max')
            .getRawOne();
        const nextNumeroVenta = (max || 0) + 1;
        let order = this.orderRepository.create({
            detalle_venta: createOrderDto.detalle_venta,
            status: 'pendiente',
            orderType,
            paymentMethod: createOrderDto.paymentMethod || 'pendiente',
            numeroVenta: nextNumeroVenta,
            total: 0,
            customer,
        });
        order = await this.orderRepository.save(order);
        if (!products.length) {
            throw new common_1.BadRequestException('La orden debe incluir productos');
        }
        const productIds = products.map(p => p.id);
        const productEntities = await this.productRepository.findBy({ id: (0, typeorm_1.In)(productIds) });
        if (productEntities.length !== products.length) {
            throw new common_1.BadRequestException('Uno o más productos no existen');
        }
        let total = 0;
        const ops = [];
        for (const p of products) {
            const prod = productEntities.find(x => x.id === p.id);
            const price = isNaN(Number(prod.price)) ? 0 : Number(prod.price);
            const cantidad = isNaN(Number(p.cantidad)) ? 0 : Number(p.cantidad);
            const subtotal = price * cantidad;
            total += subtotal;
            const op = this.productsOrdersRepository.create({
                orderId: order.id,
                productId: prod.id,
                cantidad: cantidad,
                precioUnitario: price,
                subtotal,
                order: order,
                product: prod
            });
            ops.push(op);
        }
        await this.productsOrdersRepository.save(ops);
        let costoEnvio = 0;
        try {
            const costoEnvioData = await this.costoEnvioRepository.findOne({
                where: {},
                order: { id: 'DESC' },
            });
            if (costoEnvioData) {
                costoEnvio = isNaN(Number(costoEnvioData.precio_envio)) ? 0 : Number(costoEnvioData.precio_envio);
            }
        }
        catch (error) {
            console.error('Error al obtener costo de envío, usando 0:', error);
        }
        const safeTotal = isNaN(Number(total)) ? 0 : Number(total);
        order.total = safeTotal + costoEnvio;
        await this.orderRepository.save(order);
        const full = await this.orderRepository.findOne({
            where: { id: order.id },
            relations: ['customer', 'orderProducts', 'orderProducts.product'],
        });
        const sanitized = this.sanitizeOrder(full);
        Promise.resolve().then(() => this.ordersGateway.notifyNewOrder(sanitized));
        if (customer.customerEmail) {
            try {
                const productsForEmail = ops.map(op => ({
                    name: op.product.name,
                    cantidad: op.cantidad,
                    price: op.subtotal,
                }));
                await this.mailService.sendOrderConfirmation({
                    customerEmail: customer.customerEmail,
                    customerName: customer.customerName,
                    numeroVenta: nextNumeroVenta,
                    fecha: new Date().toLocaleString('es-CL', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    orderType: 'Envío a domicilio',
                    customerAddress: customer.customerAddress || 'No especificada',
                    tiempoEstimado: '50 minutos',
                    products: productsForEmail,
                    subtotal: total,
                    costoEnvio: costoEnvio,
                    total: order.total,
                });
            }
            catch (error) {
                console.error('Error al enviar email, pero la orden se creó correctamente:', error);
            }
        }
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
            productoId: op.product?.id,
            nombre: op.product?.name || 'Producto no disponible',
            precio: op.product?.price || 0,
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
    async getHistorialPorMesa(mesaId, fecha) {
        let queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.orderProducts', 'orderProducts')
            .leftJoinAndSelect('orderProducts.product', 'product')
            .where('order.mesaId = :mesaId', { mesaId })
            .orderBy('order.createdAt', 'DESC');
        if (fecha) {
            const inicio = new Date(fecha);
            inicio.setHours(0, 0, 0, 0);
            const fin = new Date(fecha);
            fin.setHours(23, 59, 59, 999);
            queryBuilder = queryBuilder.andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });
        }
        const pedidos = await queryBuilder.getMany();
        if (!pedidos.length) {
            console.warn('⚠️ No se encontraron pedidos para la mesa', mesaId, fecha ? `en la fecha ${fecha}` : '');
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
                fechaHora: pedido.createdAt.toLocaleString('es-CL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                propina: pedido.propina,
                totalProductos,
                totalPedido: totalProductos + (pedido.propina || 0),
                products: pedido.orderProducts.map(op => ({
                    id: op.product?.id,
                    nombre: op.product?.name || 'Producto no disponible',
                    cantidad: op.cantidad,
                    precio: op.precioUnitario,
                    subtotal: op.subtotal,
                })),
            };
        });
    }
    async obtenerPendientes() {
        const orders = await this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.mesa', 'mesa')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.orderProducts', 'orderProducts')
            .leftJoinAndSelect('orderProducts.product', 'product')
            .where('order.status = :status', { status: 'pendiente' })
            .orderBy('order.createdAt', 'ASC')
            .getMany();
        orders.forEach((order, index) => {
            console.log(`🔥 Pedido ${index + 1}: ID=${order.id}, Mesa=${order.mesa?.numero_mesa}, Total=${order.total}, Status=${order.status}`);
            order.orderProducts.forEach(op => {
                console.log(`   - ${op.cantidad} x ${op.product.name} = ${op.subtotal}`);
            });
        });
        return orders;
    }
    async aceptarVenta(orderId) {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['mesa']
        });
        if (!order)
            throw new common_1.NotFoundException('Pedido no encontrado');
        order.status = 'pagado';
        order.paymentMethod = order.paymentMethod ?? 'efectivo';
        await this.orderRepository.save(order);
        const mesa = order.mesa;
        if (mesa) {
            mesa.status = 'Libre';
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
            .addSelect('SUM(order.propina)', 'total_propinas')
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
            .addSelect('SUM(order.propina)', 'propina')
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
            'order.propina AS propina',
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
            totalPropinas: Number(totales?.total_propinas || 0),
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
            orderProducts: order.orderProducts,
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
            items: order.orderProducts?.map(op => ({
                name: op.product?.name || 'Producto desconocido',
                cantidad: op.cantidad,
                precio: op.precioUnitario,
                subtotal: op.subtotal,
                imageUrl: op.product?.imageUrl ?? null,
            })) ?? [],
        };
    }
    async generarNumeroVenta() {
        try {
            this.logger.debug('   ↳ Ejecutando query MAX(numeroVenta)...');
            const { max } = await this.orderRepository
                .createQueryBuilder('order')
                .select('MAX(order.numeroVenta)', 'max')
                .getRawOne();
            this.logger.debug(`   ↳ Resultado RAW MAX:`, max);
            const parsed = parseInt(max, 10);
            if (isNaN(parsed)) {
                this.logger.error(`❌ MAX(numeroVenta) devolvió valor inválido: ${max}`);
                return 1;
            }
            return parsed + 1;
        }
        catch (error) {
            this.logger.error('❌ Error en generarNumeroVenta:', error);
            throw error;
        }
    }
    async getById(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: {
                orderProducts: {
                    product: true,
                },
                customer: true,
                mesa: true,
            }
        });
        if (!order) {
            throw new common_1.NotFoundException('Pedido no encontrado');
        }
        return this.sanitizeOrder(order);
    }
    async crearOrdenPorMesa(mesaId, createOrderDto) {
        const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
        if (!mesa) {
            throw new common_1.NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
        }
        createOrderDto.mesaId = mesaId;
        return this.create(createOrderDto);
    }
    async obtenerOrdenesPorMesa(mesaId, estado) {
        const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
        if (!mesa) {
            throw new common_1.NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
        }
        const queryBuilder = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.orderProducts', 'orderProducts')
            .leftJoinAndSelect('orderProducts.product', 'product')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.mesa', 'mesa')
            .where('order.mesaId = :mesaId', { mesaId })
            .orderBy('order.createdAt', 'DESC');
        if (estado) {
            queryBuilder.andWhere('order.estado = :estado', { estado });
        }
        const ordenes = await queryBuilder.getMany();
        return ordenes;
    }
    async obtenerOrdenEspecifica(mesaId, ordenId) {
        const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
        if (!mesa) {
            throw new common_1.NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
        }
        const orden = await this.orderRepository.findOne({
            where: { id: ordenId, mesaId },
            relations: {
                orderProducts: {
                    product: true,
                },
                customer: true,
                mesa: true,
            }
        });
        if (!orden) {
            throw new common_1.NotFoundException(`Orden con ID ${ordenId} no encontrada para la mesa ${mesaId}`);
        }
        return this.sanitizeOrder(orden);
    }
    async actualizarOrdenPorMesa(mesaId, ordenId, updateOrderDto) {
        const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
        if (!mesa) {
            throw new common_1.NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
        }
        const orden = await this.orderRepository.findOne({
            where: { id: ordenId, mesaId },
            relations: ['mesa'],
        });
        if (!orden) {
            throw new common_1.NotFoundException(`Orden con ID ${ordenId} no encontrada para la mesa ${mesaId}`);
        }
        return this.update(ordenId, updateOrderDto);
    }
    async cancelarProducto(mesaId, ordenId, productId) {
        const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
        if (!mesa) {
            throw new common_1.NotFoundException(`Mesa con ID ${mesaId} no encontrada`);
        }
        const orden = await this.orderRepository.findOne({
            where: { id: ordenId, mesaId },
            relations: ['orderProducts', 'orderProducts.product'],
        });
        if (!orden) {
            throw new common_1.NotFoundException(`Orden con ID ${ordenId} no encontrada para la mesa ${mesaId}`);
        }
        const orderProduct = await this.productsOrdersRepository.findOne({
            where: { orderId: ordenId, productId },
        });
        if (!orderProduct) {
            throw new common_1.NotFoundException(`Producto con ID ${productId} no encontrado en la orden ${ordenId}`);
        }
        if (orderProduct.deletedAt) {
            throw new common_1.BadRequestException('El producto ya está cancelado');
        }
        await this.productsOrdersRepository.softRemove(orderProduct);
        const remainingProducts = await this.productsOrdersRepository.find({
            where: { orderId: ordenId },
        });
        const newTotal = remainingProducts.reduce((sum, op) => sum + op.subtotal, 0);
        orden.total = newTotal + (orden.propina || 0);
        if (remainingProducts.length === 0) {
            orden.status = 'vacío';
            orden.propina = 0;
            orden.total = 0;
        }
        await this.orderRepository.save(orden);
        const updatedOrder = await this.orderRepository.findOne({
            where: { id: ordenId },
            relations: {
                orderProducts: {
                    product: true,
                },
                customer: true,
                mesa: true,
            }
        });
        return this.sanitizeOrder(updatedOrder);
    }
    async agregarProductosAOrden(mesaId, ordenId, productos) {
        const orden = await this.orderRepository.findOne({
            where: { id: ordenId, mesaId: mesaId },
            relations: ['orderProducts', 'orderProducts.product'],
        });
        if (!orden) {
            throw new common_1.NotFoundException(`Orden ${ordenId} no encontrada en la mesa ${mesaId}`);
        }
        if (orden.status === 'Pagado' || orden.status === 'Cancelado') {
            throw new common_1.BadRequestException('No se pueden agregar productos a una orden cerrada');
        }
        for (const item of productos) {
            if (!item)
                continue;
            const producto = await this.productRepository.findOne({ where: { id: item.productId } });
            if (!producto)
                continue;
            let orderProduct = orden.orderProducts.find((op) => op.productId === item.productId);
            if (orderProduct) {
                orderProduct.cantidad = item.cantidad;
                orderProduct.subtotal = orderProduct.cantidad * producto.price;
                if (orderProduct.cantidad <= 0) {
                    await this.productsOrdersRepository.remove(orderProduct);
                }
                else {
                    await this.productsOrdersRepository.save(orderProduct);
                }
            }
            else {
                if (item.cantidad > 0) {
                    const newOrderProduct = this.productsOrdersRepository.create({
                        order: orden,
                        product: producto,
                        cantidad: item.cantidad,
                        precioUnitario: producto.price,
                        subtotal: item.cantidad * producto.price,
                    });
                    await this.productsOrdersRepository.save(newOrderProduct);
                }
            }
        }
        const ordenActualizada = await this.orderRepository.findOne({
            where: { id: ordenId },
            relations: ['orderProducts'],
        });
        if (ordenActualizada) {
            const nuevoTotal = ordenActualizada.orderProducts.reduce((sum, op) => sum + Number(op.subtotal), 0);
            ordenActualizada.total = nuevoTotal;
            return this.orderRepository.save(ordenActualizada);
        }
        return orden;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectDataSource)()),
    __param(1, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_2.InjectRepository)(customer_entity_1.Customer)),
    __param(4, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(5, (0, typeorm_2.InjectRepository)(mesa_entity_1.Mesa)),
    __param(6, (0, typeorm_2.InjectRepository)(products_order_entity_1.ProductsOrders)),
    __param(7, (0, typeorm_2.InjectRepository)(costo_envio_entity_1.CostoEnvio)),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        orders_gateway_1.OrdersGateway,
        mail_service_1.MailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map