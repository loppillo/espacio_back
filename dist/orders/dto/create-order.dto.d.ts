declare class OrderProductDto {
    id: number;
    cantidad: number;
}
export declare class CreateOrderDto {
    tableNumber?: number;
    orderType: string;
    detalle_venta?: string;
    propina: number;
    status: string;
    paymentMethod: string;
    mesaId?: number;
    products: OrderProductDto[];
}
export {};
