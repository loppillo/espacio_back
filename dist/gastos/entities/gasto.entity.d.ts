import { CategoriaGasto } from 'src/categoria-gasto/entities/categoria-gasto.entity';
import { Customer } from 'src/customer/entities/customer.entity';
export declare class Gasto {
    id: number;
    amount: number;
    description?: string;
    concepto?: string;
    type: 'ingreso' | 'egreso';
    paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque';
    customer?: Customer;
    categoria_gasto?: CategoriaGasto;
    createdAt: Date;
    frequency: 'ninguno' | 'diario' | 'semanal' | 'mensual';
    startDate: Date;
    endDate?: Date;
    dayOfWeek?: number;
    dayOfMonth?: number;
}
