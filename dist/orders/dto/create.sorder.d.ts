export declare class CreateSOrderDto {
    mesaId?: number;
    productIds?: number[];
    customerId?: number;
    cantidad?: number;
    total?: number;
    propina?: number;
    status?: string;
    orderType?: string;
    paymentMethod?: string;
    newCustomer?: {
        name: string;
        email?: string;
    };
}
