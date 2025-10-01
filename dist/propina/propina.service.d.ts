import { CreatePropinaDto } from './dto/create-propina.dto';
import { UpdatePropinaDto } from './dto/update-propina.dto';
import { Propina } from './entities/propina.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
export declare class PropinaService {
    private readonly orderRepository;
    private readonly propinaRepository;
    constructor(orderRepository: Repository<Order>, propinaRepository: Repository<Propina>);
    create(createPropinaDto: CreatePropinaDto): Promise<{
        amount: number;
        orderId: Order;
    } & Propina>;
    findAll(): Promise<Propina[]>;
    findOne(id: number): Promise<Propina>;
    update(id: number, updatePropinaDto: UpdatePropinaDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}
