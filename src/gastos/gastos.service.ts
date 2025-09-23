import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { Gasto } from './entities/gasto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, getManager } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';


export enum Frecuencia {
  DIARIO = 'diario',
  SEMANAL = 'semanal',
  MENSUAL = 'mensual',
}


@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private readonly expenseRepository: Repository<Gasto>,
    private dataSource: DataSource
  ) {}

  findAll(): Promise<Gasto[]> {
    return this.expenseRepository.find();
  }

  async getBalancePorFecha(ingresosWhere?: any, egresosWhere?: any) {
    const entityManager = this.dataSource.manager;

    // Query de ingresos (orders)
    const ingresosQuery = entityManager
      .createQueryBuilder()
      .select("DATE(o.createdAt)", "fecha")
      .addSelect("SUM(o.total)", "ingresos")
      .addSelect("0", "egresos")
      .from("orders", "o");

    if (ingresosWhere && typeof ingresosWhere === 'object') {
      Object.entries(ingresosWhere).forEach(([key, value], index) => {
        if (
          value !== undefined &&
          value !== null &&
          !(typeof value === 'number' && Number.isNaN(value))
        ) {
          const paramName = `ingresoParam${index}`;
          ingresosQuery.andWhere(`o.${key} = :${paramName}`, { [paramName]: value });
        }
      });
    }

    ingresosQuery.groupBy("DATE(o.createdAt)");

    // Query de egresos (expenses)
    const egresosQuery = entityManager
      .createQueryBuilder()
      .select("DATE(e.createdAt)", "fecha")
      .addSelect("0", "ingresos")
      .addSelect("SUM(e.amount)", "egresos")
      .from("expenses", "e");

    if (egresosWhere && typeof egresosWhere === 'object') {
      Object.entries(egresosWhere).forEach(([key, value], index) => {
        if (
          value !== undefined &&
          value !== null &&
          !(typeof value === 'number' && Number.isNaN(value))
        ) {
          const paramName = `egresoParam${index}`;
          egresosQuery.andWhere(`e.${key} = :${paramName}`, { [paramName]: value });
        }
      });
    }

    egresosQuery.groupBy("DATE(e.createdAt)");

    // Unión de ambos resultados y agrupación final por fecha
    const unionQuery = entityManager
      .createQueryBuilder()
      .select("fecha")
      .addSelect("SUM(ingresos)", "ingresos")
      .addSelect("SUM(egresos)", "egresos")
      .addSelect("SUM(ingresos) - SUM(egresos)", "balance")
      .from(`(${ingresosQuery.getQuery()} UNION ALL ${egresosQuery.getQuery()})`, "movimientos")
      .groupBy("fecha")
      .orderBy("fecha", "DESC")
      .setParameters({
        ...ingresosQuery.getParameters(),
        ...egresosQuery.getParameters(),
      });

    return unionQuery.getRawMany();
  }

  findOne(id: number): Promise<Gasto> {
    return this.expenseRepository.findOneBy({ id });
  }

  create(expenseData: Partial<Gasto>): Promise<Gasto> {
    const expense = this.expenseRepository.create(expenseData);
    return this.expenseRepository.save(expense);
  }

  async remove(id: number): Promise<void> {
    await this.expenseRepository.delete(id);
  }

   async getBalanceMensual(anio: number) {
    const data = await this.expenseRepository.query(`
      SELECT 
        MONTH(fecha) AS mes,
        SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
        SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) AS egresos
      FROM gastos
      WHERE YEAR(fecha) = ?
      GROUP BY MONTH(fecha)
      ORDER BY mes
    `, [anio]);

    return data;
  }
async getBalanceAnual() {
  try {
    const data = await this.expenseRepository.query(`
      SELECT 
        YEAR(createdAt) AS anio,
        SUM(CASE WHEN type = 'ingreso' THEN amount ELSE 0 END) AS ingresos,
        SUM(CASE WHEN type = 'egreso' THEN amount ELSE 0 END) AS egresos
      FROM expenses
      GROUP BY YEAR(createdAt)
      ORDER BY anio
    `);

    return data;
  } catch (error) {
    console.error('Error en getBalanceAnual:', error);
    throw new InternalServerErrorException('No se pudo obtener el balance anual');
  }
}

async getBalancePorAnio(anio?: number) {
  const entityManager = this.dataSource.manager;

  const whereFechaIngresos = anio
    ? `WHERE YEAR(createdAt) = ${anio} AND status = 'vendido'`
    : `WHERE status = 'vendido'`;

  const whereFechaEgresos = anio
    ? `WHERE type = 'egreso' AND YEAR(createdAt) = ${anio}`
    : `WHERE type = 'egreso'`;

  const ingresosQuery = `
    SELECT 
      YEAR(createdAt) AS anio,
      SUM(total) AS ingresos,
      SUM(propina) AS propinas,
      0 AS egresos
    FROM orders
    ${whereFechaIngresos}
    GROUP BY YEAR(createdAt)
  `;

  const egresosQuery = `
    SELECT 
      YEAR(createdAt) AS anio,
      0 AS ingresos,
      0 AS propinas,
      SUM(amount) AS egresos
    FROM expenses
    ${whereFechaEgresos}
    GROUP BY YEAR(createdAt)
  `;

  const [ingresos, egresos] = await Promise.all([
    entityManager.query(ingresosQuery),
    entityManager.query(egresosQuery),
  ]);

  const resultadoMap = new Map<number, any>();

  for (const row of [...ingresos, ...egresos]) {
    const anio = row.anio;
    if (!resultadoMap.has(anio)) {
      resultadoMap.set(anio, { anio, ingresos: 0, egresos: 0, propinas: 0 });
    }
    const current = resultadoMap.get(anio);
    current.ingresos += Number(row.ingresos);
    current.egresos += Number(row.egresos);
    current.propinas += Number(row.propinas);
  }

  return Array.from(resultadoMap.values()).sort((a, b) => a.anio - b.anio);
}


// balance.service.ts
async getBalanceDiario(fecha: string): Promise<{
  fecha: string,
  totalIngresos: number,
  totalEgresos: number,
  productosVendidos: { producto: string, cantidad: number, total: number, propina: number }[]
}[]> {
  const entityManager = this.dataSource.manager;

  // Obtener ingresos solo con status 'vendido'
  const ingresos = await entityManager
    .createQueryBuilder()
    .select("DATE(o.createdAt)", "fecha")
    .addSelect("SUM(o.total)", "totalIngresos")
    .addSelect("SUM(o.propina)", "totalPropina")
    .addSelect("p.name AS producto")
    .addSelect("SUM(o.cantidad) AS cantidad")
    .from("orders", "o")
    .innerJoin("o.products", "p")
    .where("DATE(o.createdAt) = :fecha", { fecha })
    .andWhere("o.status = :status", { status: 'vendido' }) // 🔥 Filtrar por status
    .groupBy("fecha, p.name")
    .getRawMany();

  // Obtener egresos
  const egresos = await entityManager
    .createQueryBuilder()
    .select("DATE(e.createdAt)", "fecha")
    .addSelect("SUM(e.amount)", "totalEgresos")
    .from("expenses", "e")
    .where("DATE(e.createdAt) = :fecha", { fecha })
    .groupBy("fecha")
    .getRawOne();

  // Agrupar productos del mismo día
  const agrupados = new Map<string, {
    fecha: string,
    totalIngresos: number,
    totalEgresos: number,
    productosVendidos: { producto: string, cantidad: number, total: number, propina: number }[]
  }>();

  ingresos.forEach(i => {
    const key = i.fecha;
    const ingresoTotal = parseFloat(i.totalIngresos) + parseFloat(i.totalPropina);

    if (!agrupados.has(key)) {
      agrupados.set(key, {
        fecha: key,
        totalIngresos: ingresoTotal,
        totalEgresos: egresos ? parseFloat(egresos.totalEgresos) : 0,
        productosVendidos: []
      });
    }

    agrupados.get(key)?.productosVendidos.push({
      producto: i.producto,
      cantidad: parseInt(i.cantidad, 10),
      total: parseFloat(i.totalIngresos),
      propina: parseFloat(i.totalPropina)
    });
  });

  return Array.from(agrupados.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
}


/* @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generarGastosRecurrentes() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diaMes = hoy.getDate();

    const gastos = await this.expenseRepository.find();

    for (const g of gastos) {
      // Solo si no ha pasado la fecha de fin
      if (!g.endDate || hoy <= new Date(g.endDate)) {
        if (g.frequency === Frecuencia.DIARIO) {
          await this.crearGasto(g);
        } else if (g.frequency === Frecuencia.SEMANAL && g.dayOfWeek === diaSemana) {
          await this.crearGasto(g);
        } else if (g.frequency === Frecuencia.MENSUAL && g.dayOfMonth === diaMes) {
          await this.crearGasto(g);
        }
      }
    }
  }
*/
  private async crearGasto(g: Gasto) {
    await this.expenseRepository.save({
      ...g,
      id: undefined, // crear nuevo registro
      createdAt: new Date(),
    });
  }

  // Método para crear un gasto desde un endpoint
  async crearGastoManual(data: Partial<Gasto>): Promise<Gasto> {
    const gasto = this.expenseRepository.create(data);
    return await this.expenseRepository.save(gasto);
  }

}
