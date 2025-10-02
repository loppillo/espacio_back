declare class OrderProductDto {
    id: number;
    cantidad: number;
}
export declare class CreateSOrderDto {
    mesaId?: number;
    products: OrderProductDto[];
    customerId?: number;
    cantidad?: number;
    total?: number;
    propina?: number;
    status?: string;
    orderType?: string;
    paymentMethod?: string;
    detalle_venta?: string;
    newCustomer?: {
        name: string;
        email?: string;
        direccion?: string;
        telefono?: string;
    };
}
export {};
