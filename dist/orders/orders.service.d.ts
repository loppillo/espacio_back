import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Propina } from 'src/propina/entities/propina.entity';
import { CreateSOrderDto } from './dto/create.sorder';
import { Mesa } from 'src/mesas/entities/mesa.entity';
export declare class OrdersService {
    private readonly orderRepository;
    private readonly userRepository;
    private readonly customerRepository;
    private readonly productRepository;
    private readonly propinaRepository;
    private readonly mesaRepository;
    constructor(orderRepository: Repository<Order>, userRepository: Repository<User>, customerRepository: Repository<Customer>, productRepository: Repository<Product>, propinaRepository: Repository<Propina>, mesaRepository: Repository<Mesa>);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    creates(createOrderDto: CreateSOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: number): Promise<Order>;
    update(id: number, updateOrderDto: UpdateOrderDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<{
        message: string;
        id: number;
    }>;
    cancelarOrden(id: number): Promise<Order>;
    getProductosPorMesa(mesaId: number): Promise<any[]>;
    eliminarProducto(orderId: number, productId: number): Promise<{
        message: string;
    }>;
}
