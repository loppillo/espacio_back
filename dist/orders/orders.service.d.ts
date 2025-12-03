import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { CreateSOrderDto } from './dto/create.sorder';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { OrdersGateway } from './orders.gateway';
import { MailService } from 'src/mail/mail.service';
import { CostoEnvio } from 'src/costo_envio/entities/costo_envio.entity';
export declare class OrdersService {
    private dataSource;
    private readonly orderRepository;
    private readonly userRepository;
    private readonly customerRepository;
    private readonly productRepository;
    private readonly mesaRepository;
    private readonly productsOrdersRepository;
    private readonly costoEnvioRepository;
    private ordersGateway;
    private mailService;
    private readonly logger;
    constructor(dataSource: DataSource, orderRepository: Repository<Order>, userRepository: Repository<User>, customerRepository: Repository<Customer>, productRepository: Repository<Product>, mesaRepository: Repository<Mesa>, productsOrdersRepository: Repository<ProductsOrders>, costoEnvioRepository: Repository<CostoEnvio>, ordersGateway: OrdersGateway, mailService: MailService);
    update(id: number, dto: UpdateOrderDto & {
        propinaTipo?: string;
        propinaValor?: number;
    }): Promise<Order>;
    create(createOrderDto: CreateOrderDto): Promise<any>;
    creates(createOrderDto: CreateSOrderDto): Promise<any>;
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    remove(id: number): Promise<{
        message: string;
        id: number;
    }>;
    cancelarOrden(id: number): Promise<Order>;
    getProductosPorMesa(mesaId: number): Promise<any[]>;
    eliminarProducto(orderId: number, productId: number): Promise<Order>;
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
    obtenerPendientes(): Promise<Order[]>;
    aceptarVenta(orderId: number): Promise<Order>;
    cancelarVenta(orderId: number): Promise<Order>;
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
    private sanitizeOrder;
    private generarNumeroVenta;
    getById(id: number): Promise<any>;
    crearOrdenPorMesa(mesaId: number, createOrderDto: CreateOrderDto): Promise<any>;
    obtenerOrdenesPorMesa(mesaId: number, estado?: string): Promise<Order[]>;
    obtenerOrdenEspecifica(mesaId: number, ordenId: number): Promise<any>;
    actualizarOrdenPorMesa(mesaId: number, ordenId: number, updateOrderDto: UpdateOrderDto): Promise<Order>;
    cancelarProducto(mesaId: number, ordenId: number, productId: number): Promise<any>;
    agregarProductosAOrden(mesaId: number, ordenId: number, productos: {
        productId: number;
        cantidad: number;
    }[]): Promise<Order>;
}
