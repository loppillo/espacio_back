import { GastosService } from './gastos.service';
import { Gasto } from './entities/gasto.entity';
export declare class GastosController {
    private readonly expensesService;
    constructor(expensesService: GastosService);
    getBalance(startDate?: string, endDate?: string): Promise<any[]>;
    getBalancePorAnio(anio?: number): Promise<any>;
    getBalanceDiario(fecha: string): Promise<{
        fecha: string;
        totalIngresos: number;
        totalEgresos: number;
        productosVendidos: {
            producto: string;
            cantidad: number;
            total: number;
            propina: number;
        }[];
    }[]>;
    getMensual(anio: number): Promise<any>;
    getAnual(): Promise<any>;
    getAll(): Promise<Gasto[]>;
    getOne(id: number): Promise<Gasto>;
    crearGasto(body: Partial<Gasto>): Promise<Gasto>;
    remove(id: number): Promise<void>;
}
