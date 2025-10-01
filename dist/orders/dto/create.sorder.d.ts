import { CustomerDto } from "./create-customer.dto";
export declare class CreateSOrderDto {
    tableNumber: number;
    detalle_venta: string;
    orderType: string;
    cantidad: number;
    status: string;
    propina?: number;
    total: number;
    paymentMethod: string;
    customerId?: number;
    newCustomer?: CustomerDto;
    productIds?: number[];
    createdAt: Date;
}
