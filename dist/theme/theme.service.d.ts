import { Repository } from 'typeorm';
import { Theme } from './entities/theme.entity';
import { OrdersGateway } from 'src/orders/orders.gateway';
export declare class ThemeService {
    private readonly repo;
    private readonly gateway;
    constructor(repo: Repository<Theme>, gateway: OrdersGateway);
    findAll(): Promise<Theme[]>;
    findDefault(): Promise<Theme>;
    findOne(id: number): Promise<Theme>;
    create(data: Partial<Theme>): Promise<Theme>;
    update(id: number, data: Partial<Theme>): Promise<Theme>;
    activate(id: number): Promise<Theme>;
}
