import { Gasto } from './entities/gasto.entity';
import { Repository, DataSource } from 'typeorm';
export declare enum Frecuencia {
    DIARIO = "diario",
    SEMANAL = "semanal",
    MENSUAL = "mensual"
}
export declare class GastosService {
    private readonly expenseRepository;
    private dataSource;
    constructor(expenseRepository: Repository<Gasto>, dataSource: DataSource);
    findAll(): Promise<Gasto[]>;
    getBalancePorFecha(ingresosWhere?: any, egresosWhere?: any): Promise<any[]>;
    findOne(id: number): Promise<Gasto>;
    create(expenseData: Partial<Gasto>): Promise<Gasto>;
    remove(id: number): Promise<void>;
    getBalanceMensual(anio: number, mes: number): Promise<{
        ingresos: number;
        egresos: number;
        balance: number;
    }>;
    getBalanceAnual(anio: number): Promise<any>;
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
    private crearGasto;
    crearGastoManual(data: Partial<Gasto>): Promise<Gasto>;
    estadisticas(filtro: {
        type?: any;
        periodo?: any;
        valor?: any;
    }): Promise<{}>;
}
