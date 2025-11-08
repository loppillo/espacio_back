import { GastosService } from './gastos.service';
import { Gasto } from './entities/gasto.entity';
export declare class GastosController {
    private readonly expensesService;
    constructor(expensesService: GastosService);
    estadisticas(periodo: 'dia' | 'mes' | 'anio', valor: string): Promise<{
        labels: string[];
        ingresos: number[];
        egresos: number[];
        propinas: number[];
        balance: number[];
    }>;
    getMensual(anio: string, mes: string): Promise<{
        ingresos: number[];
        egresos: number[];
        propinas: number[];
        balance: number[];
    }>;
    getAnual(anio: string): Promise<{
        mes: number;
        ingresos: any;
        egresos: any;
        propinas: any;
        balance: number;
    }[]>;
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
    getAll(): Promise<Gasto[]>;
    getOne(id: number): Promise<Gasto>;
    crearGasto(body: Partial<Gasto>): Promise<Gasto>;
    remove(id: number): Promise<void>;
}
