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
    obtenerPendientes(): Promise<Order[]>;
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    getHistorialPorMesa(mesaId: number): Promise<{
        numeroVenta: number;
        mesaId: number;
        status: string;
        estado: string;
        createdAt: Date;
        propina: number;
        totalProductos: number;
        totalPedido: number;
        products: {
            id: number;
            nombre: string;
            cantidad: number;
            precio: number;
            subtotal: number;
        }[];
    }[]>;
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
    eliminarProducto(orderId: number, productId: number): Promise<Order>;
    print(body: any): Promise<{
        success: boolean;
    }>;
    aceptarVenta(id: number): Promise<Order>;
    cancelarVenta(id: number): Promise<Order>;
    getVentasDiarias(desde?: string, hasta?: string, orderType?: string): Promise<{
        totalVentas: number;
        cantidadPedidos: number;
        rango: {
            desde: Date;
            hasta: Date;
        };
        grafico: any[];
        detalles: any[];
    }>;
}
