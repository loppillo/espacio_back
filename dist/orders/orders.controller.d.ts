import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateSOrderDto } from './dto/create.sorder';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { PrintService } from './print/print.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly orderRepository;
    private readonly printService;
    constructor(ordersService: OrdersService, orderRepository: Repository<Order>, printService: PrintService);
    getHistorialPorMesaYDia(mesaId: number): Promise<{
        numeroVenta: number;
        mesa: any;
        customer: any;
        user: any;
        detalle_venta: any;
        status: any;
        createdAt: any;
        propina: any;
        totalProductos: any;
        totalPedido: any;
        products: any[];
    }[]>;
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    creates(createOrderDto: CreateSOrderDto): Promise<Order>;
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
    getHistorial(mesaId: number): Promise<any[]>;
    eliminarProducto(orderId: number, productId: number): Promise<Order>;
    print(body: any): Promise<{
        success: boolean;
    }>;
}
