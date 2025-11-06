import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Propina } from 'src/propina/entities/propina.entity';
import { CreateSOrderDto } from './dto/create.sorder';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { OrdersGateway } from './orders.gateway';
export declare class OrdersService {
    private dataSource;
    private readonly orderRepository;
    private readonly userRepository;
    private readonly customerRepository;
    private readonly productRepository;
    private readonly propinaRepository;
    private readonly mesaRepository;
    private readonly productsOrdersRepository;
    private ordersGateway;
    constructor(dataSource: DataSource, orderRepository: Repository<Order>, userRepository: Repository<User>, customerRepository: Repository<Customer>, productRepository: Repository<Product>, propinaRepository: Repository<Propina>, mesaRepository: Repository<Mesa>, productsOrdersRepository: Repository<ProductsOrders>, ordersGateway: OrdersGateway);
    create(createOrderDto: CreateOrderDto): Promise<any>;
    creates(createOrderDto: CreateSOrderDto): Promise<any>;
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    update(id: number, updateOrderDto: UpdateOrderDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<{
        message: string;
        id: number;
    }>;
    cancelarOrden(id: number): Promise<Order>;
    getProductosPorMesa(mesaId: number): Promise<any[]>;
    eliminarProducto(orderId: number, productId: number): Promise<Order>;
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
    obtenerPendientes(): Promise<Order[]>;
    aceptarVenta(orderId: number): Promise<Order>;
    cancelarVenta(orderId: number): Promise<Order>;
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
}
