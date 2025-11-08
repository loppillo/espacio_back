import { PropinaService } from './propina.service';
import { CreatePropinaDto } from './dto/create-propina.dto';
import { UpdatePropinaDto } from './dto/update-propina.dto';
export declare class PropinaController {
    private readonly propinaService;
    constructor(propinaService: PropinaService);
    create(createPropinaDto: CreatePropinaDto): Promise<{
        amount: number;
        orderId: import("../orders/entities/order.entity").Order;
    } & import("./entities/propina.entity").Propina>;
    findAll(): Promise<import("./entities/propina.entity").Propina[]>;
    findOne(id: string): Promise<import("./entities/propina.entity").Propina>;
    update(id: string, updatePropinaDto: UpdatePropinaDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
