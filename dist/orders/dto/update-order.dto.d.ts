export declare class UpdateOrderDto {
    tableNumber?: number;
    orderType?: string;
    status?: string;
    total?: number;
    propinaTipo?: '5' | '10' | '12' | 'custom' | 'none';
    propinaValor?: number;
    createdAt?: Date;
    userId?: number;
    customerId?: number;
}
