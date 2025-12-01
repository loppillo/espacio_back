import { OrdersService } from './orders.service';
import { AgregarProductosDto, CreateOrderDto } from './dto/create-order.dto';
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
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    obtenerPendientes(): Promise<Order[]>;
    getById(id: number): Promise<any>;
    create(createOrderDto: CreateOrderDto): Promise<any>;
    getHistorialPorMesa(mesaId: number, fecha?: string): Promise<{
        numeroVenta: number;
        mesaId: number;
        status: string;
        estado: string;
        createdAt: Date;
        fechaHora: string;
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
    creates(createOrderDto: CreateSOrderDto): Promise<any>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
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
        totalPropinas: number;
        cantidadPedidos: number;
        rango: {
            desde: Date;
            hasta: Date;
        };
        grafico: any[];
        detalles: any[];
    }>;
    getVentasDiariasxMesa(desde?: string, hasta?: string, mesaId?: number): Promise<any[]>;
    cancelarVentas(fecha?: string, mesaId?: number): Promise<{
        message: string;
        afectadas: number;
    }>;
    cancelar(id: number): Promise<{
        message: string;
    }>;
    crearOrdenPorMesa(mesaId: number, createOrderDto: CreateOrderDto): Promise<any>;
    obtenerOrdenesPorMesa(mesaId: number, estado?: string): Promise<Order[]>;
    obtenerOrdenEspecifica(mesaId: number, ordenId: number): Promise<any>;
    actualizarOrdenPorMesa(mesaId: number, ordenId: number, updateOrderDto: UpdateOrderDto): Promise<Order>;
    cancelarProducto(mesaId: number, ordenId: number, productId: number): Promise<any>;
    agregarProductosAOrden(mesaId: number, ordenId: number, dto: AgregarProductosDto): Promise<Order>;
}
