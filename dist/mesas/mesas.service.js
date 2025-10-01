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
exports.MesaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mesa_entity_1 = require("./entities/mesa.entity");
const order_entity_1 = require("../orders/entities/order.entity");
let MesaService = class MesaService {
    constructor(mesaRepository, ordersRepository) {
        this.mesaRepository = mesaRepository;
        this.ordersRepository = ordersRepository;
    }
    async findAll() {
        return this.mesaRepository.find({ relations: ['orders'] });
    }
    async findOne(id) {
        return this.mesaRepository.findOne({
            where: { id },
            order: { numero_mesa: 'ASC' },
        });
    }
    async create(createMesaDto) {
        const mesa = this.mesaRepository.create(createMesaDto);
        return this.mesaRepository.save(mesa);
    }
    async update(id, updateMesaDto) {
        const mesa = await this.findOne(id);
        Object.assign(mesa, updateMesaDto);
        return this.mesaRepository.save(mesa);
    }
    async remove(id) {
        const mesa = await this.findOne(id);
        await this.mesaRepository.remove(mesa);
    }
    async obtenerMesaPorId(id) {
        const mesa = await this.mesaRepository.findOne({
            where: { id },
            relations: ['orders', 'products'],
        });
        if (!mesa) {
            throw new common_1.NotFoundException(`La mesa con ID ${id} no existe`);
        }
        return mesa;
    }
    async actualizarEstadoMesa(id, status) {
        const mesa = await this.mesaRepository.findOne({ where: { id } });
        if (!mesa) {
            throw new common_1.NotFoundException('Mesa no encontrada');
        }
        mesa.status = status;
        return await this.mesaRepository.save(mesa);
    }
    async obtenerDetalleMesa(id) {
        const mesa = await this.mesaRepository.findOne({
            where: { id },
            relations: [
                'orders',
                'orders.orderProducts',
                'orders.orderProducts.product',
            ],
        });
        if (!mesa) {
            throw new common_1.NotFoundException(`Mesa con id ${id} no encontrada`);
        }
        return mesa;
    }
    async marcarPedidoPagado(mesaId) {
        const mesa = await this.mesaRepository.findOne({
            where: { id: mesaId },
            relations: ['orders'],
        });
        if (!mesa)
            throw new common_1.NotFoundException('Mesa no encontrada');
        if (mesa.orders && mesa.orders.length > 0) {
            mesa.orders.forEach(order => (order.status = 'Pagado'));
            await this.ordersRepository.save(mesa.orders);
        }
        mesa.status = 'Libre';
        mesa.orders = [];
        return this.mesaRepository.save(mesa);
    }
    async getMesa(mesaId) {
        const mesa = await this.mesaRepository.findOne({
            where: { id: mesaId },
        });
        if (!mesa)
            throw new common_1.NotFoundException('Mesa no encontrada');
        return mesa;
    }
    async crearNuevoPedido(mesaId) {
        const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
        if (!mesa)
            throw new common_1.NotFoundException('Mesa no encontrada');
        const lastOrder = await this.ordersRepository.findOne({
            where: {},
            order: { id: 'DESC' },
        });
        const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;
        const pedido = this.ordersRepository.create({
            tableNumber: Number(mesa.numero_mesa),
            propina: 0,
            numeroVenta: nextNumeroVenta,
            status: 'Activo',
            total: 0,
            orderType: 'default',
            orderProducts: []
        });
        mesa.status = 'Ocupada';
        await this.mesaRepository.save(mesa);
        return await this.ordersRepository.save(pedido);
    }
    async getPedidosActuales(mesaId, numeroVenta) {
        return this.ordersRepository.find({
            where: { mesa: { id: mesaId }, numeroVenta },
        });
    }
    async getProductosPorMesa(mesaId) {
        const orders = await this.ordersRepository.find({
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
            cantidad: op.cantidad,
            precioUnitario: op.precioUnitario,
            subtotal: op.subtotal,
        })));
        return productos;
    }
    async eliminarProducto(orderId, productId) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['orderProducts', 'orderProducts.product'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Orden no encontrada');
        }
        const productOrder = order.orderProducts.find((op) => op.product.id === productId);
        if (!productOrder) {
            throw new common_1.NotFoundException(`El producto con id ${productId} no está en la orden`);
        }
        if (productOrder.cantidad > 1) {
            productOrder.cantidad -= 1;
            await this.ordersRepository.save(order);
        }
        else {
            order.orderProducts = order.orderProducts.filter((op) => op.product.id !== productId);
            await this.ordersRepository.save(order);
        }
        return { message: 'Producto eliminado correctamente' };
    }
};
exports.MesaService = MesaService;
exports.MesaService = MesaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mesa_entity_1.Mesa)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MesaService);
//# sourceMappingURL=mesas.service.js.map