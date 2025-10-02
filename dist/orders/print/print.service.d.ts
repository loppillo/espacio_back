export declare class PrintService {
    private formatLine;
    printFactura(data: {
        header?: string;
        nombre: string;
        apellido: string;
        direccion: string;
        telefono: string;
        email: string;
        pago: string;
        carrito: {
            name: string;
            cantidad: number;
            price: number;
        }[];
        footer?: string;
        ip?: string;
    }): Promise<{
        success: boolean;
    }>;
}
