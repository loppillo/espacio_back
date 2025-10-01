import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateSOrderDto } from './dto/create.sorder';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
export declare class OrdersController {
    private readonly ordersService;
    private readonly orderRepository;
    constructor(ordersService: OrdersService, orderRepository: Repository<Order>);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    creates(createOrderDto: CreateSOrderDto): Promise<void>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<{
        message: string;
        id: number;
    }>;
    cancelarOrden(id: number): Promise<Order>;
    obtenerVentasPorDia(fecha: string): Promise<{
        id: number;
        fecha: Date;
        status: string;
        total: number;
    }[]>;
    getProductosPorMesa(mesaId: number): Promise<any[]>;
    eliminarProducto(orderId: number, productId: number): Promise<{
        message: string;
    }>;
}
