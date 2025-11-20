export declare class MailService {
    private transporter;
    constructor();
    sendOrderConfirmation(orderData: {
        customerEmail: string;
        customerName: string;
        numeroVenta: number;
        fecha: string;
        orderType: string;
        customerAddress?: string;
        tiempoEstimado?: string;
        products: Array<{
            name: string;
            cantidad: number;
            price: number;
        }>;
        subtotal: number;
        costoEnvio: number;
        total: number;
    }): Promise<void>;
}
