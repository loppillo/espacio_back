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
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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

async getBalanceMensual(anio: number, mes: number) {
  // 1) Egresos diarios desde expenses
  const egresoRows = await this.expenseRepository.query(
    `
    SELECT 
      DAY(createdAt) AS dia,
      SUM(amount) AS egresos
    FROM expenses
    WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
    GROUP BY DAY(createdAt)
    `,
    [anio, mes]
  );

  // 2) Ingresos y propinas diarios desde orders
  const orderRows = await this.orderRepository.query(
    `
    SELECT
      DAY(createdAt) AS dia,
      SUM(total) AS ingresos,
      SUM(propina) AS propinas
    FROM orders
    WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
      AND status != 'cancelado'
    GROUP BY DAY(createdAt)
    `,
    [anio, mes]
  );

  // Inicializamos arrays de 31 días
  const dias = Array.from({ length: 31 }, () => 0);
  const ingresos = Array.from({ length: 31 }, () => 0);
  const egresos = Array.from({ length: 31 }, () => 0);
  const propinas = Array.from({ length: 31 }, () => 0);
  const balance = Array.from({ length: 31 }, () => 0);

  egresoRows.forEach((r: any) => {
    const idx = r.dia - 1;
    egresos[idx] = Number(r.egresos || 0);
  });

  orderRows.forEach((r: any) => {
    const idx = r.dia - 1;
    ingresos[idx] = Number(r.ingresos || 0);
    propinas[idx] = Number(r.propinas || 0);
  });

  // Calculamos balance diario
  for (let i = 0; i < 31; i++) {
    balance[i] = ingresos[i] - egresos[i]; // SIN propinas
  }

  return { ingresos, egresos, propinas, balance };
}



async getBalanceAnual(anio: number) {
  // 1) Egresos por mes desde expenses
  const expRows = await this.expenseRepository.query(
    `
    SELECT 
      MONTH(createdAt) AS mes,
      SUM(CASE WHEN type = 'egreso' THEN amount ELSE 0 END) AS egresos
    FROM expenses
    WHERE YEAR(createdAt) = ?
    GROUP BY MONTH(createdAt)
    ORDER BY mes
    `,
    [anio],
  );

  // 2) Ingresos + propinas por mes desde orders
  const orderRows = await this.orderRepository.query(
    `
    SELECT
      MONTH(createdAt) AS mes,
      SUM(total) AS ingresos,
      SUM(propina) AS propinas
    FROM orders
    WHERE YEAR(createdAt) = ?
      AND status != 'cancelado'
    GROUP BY MONTH(createdAt)
    ORDER BY mes
    `,
    [anio],
  );

  // fusionar meses
  const byMonth: Record<number, any> = {};

  // primero egresos
  expRows.forEach(r => {
    byMonth[r.mes] = { egresos: Number(r.egresos || 0), ingresos: 0, propinas: 0 };
  });

  // luego ingresos y propinas
  orderRows.forEach(r => {
    if (!byMonth[r.mes]) {
      byMonth[r.mes] = { egresos: 0, ingresos: 0, propinas: 0 };
    }

    byMonth[r.mes].ingresos = Number(r.ingresos || 0);
    byMonth[r.mes].propinas = Number(r.propinas || 0);
  });

  // convertir en array ordenado
  return Object.entries(byMonth).map(([mes, d]) => ({
    mes: Number(mes),
    ingresos: d.ingresos,
    egresos: d.egresos,
    propinas: d.propinas,
    balance: d.ingresos - d.egresos,
  }));
}



async getBalancePorAnio(anio?: number) {
  const entityManager = this.dataSource.manager;

  const filtroOrders = anio
    ? `WHERE YEAR(o.createdAt) = ${anio} AND (o.status = 'vendido' OR o.status = 'Pagado')`
    : `WHERE (o.status = 'vendido' OR o.status = 'Pagado')`;

  const filtroExpenses = anio
    ? `WHERE YEAR(e.createdAt) = ${anio} AND e.type = 'egreso'`
    : `WHERE e.type = 'egreso'`;

  const query = `
    SELECT anio,
           SUM(ingresos) AS ingresos,
           SUM(propinas) AS propinas,
           SUM(egresos) AS egresos,
           (SUM(ingresos) - SUM(egresos)) AS balance
    FROM (
      -- ingresos (orders)
      SELECT 
        YEAR(o.createdAt) AS anio,
        SUM(o.total) AS ingresos,
        SUM(o.propina) AS propinas,
        0 AS egresos
      FROM orders o
      ${filtroOrders}
      GROUP BY YEAR(o.createdAt)

      UNION ALL

      -- egresos (expenses)
      SELECT 
        YEAR(e.createdAt) AS anio,
        0 AS ingresos,
        0 AS propinas,
        SUM(e.amount) AS egresos
      FROM expenses e
      ${filtroExpenses}
      GROUP BY YEAR(e.createdAt)
    ) resumen
    GROUP BY anio
    ORDER BY anio ASC
  `;

  return await entityManager.query(query);
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
    .andWhere("o.status = :status", { status: 'Pagado' }) // 🔥 Filtrar por status
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

  // gasto.service.ts

async estadisticas(filtro: { type?; periodo?; valor? }) {

  // ==== QUERY GASTOS ====
  const gastosQ = this.expenseRepository.createQueryBuilder('gasto');

  if (filtro.type) {
    gastosQ.andWhere('gasto.type = :type', { type: filtro.type });
  }

  if (filtro.periodo === 'dia') {
    gastosQ.andWhere("DATE(gasto.createdAt) = :valor", { valor: filtro.valor });
  }

  if (filtro.periodo === 'mes') {
    gastosQ.andWhere("DATE_FORMAT(gasto.createdAt, '%Y-%m') = :valor", { valor: filtro.valor });
  }

  if (filtro.periodo === 'anio') {
    gastosQ.andWhere("DATE_FORMAT(gasto.createdAt, '%Y') = :valor", { valor: filtro.valor });
  }

  const gastos = await gastosQ.getMany();


  // ==== QUERY ORDERS ====
  const ventasQ = this.orderRepository.createQueryBuilder('orden');

  if (filtro.periodo === 'dia') {
    ventasQ.andWhere("DATE(orden.createdAt) = :valor", { valor: filtro.valor });
  }

  if (filtro.periodo === 'mes') {
    ventasQ.andWhere("DATE_FORMAT(orden.createdAt, '%Y-%m') = :valor", { valor: filtro.valor });
  }

  if (filtro.periodo === 'anio') {
    ventasQ.andWhere("DATE_FORMAT(orden.createdAt, '%Y') = :valor", { valor: filtro.valor });
  }

  const ventas = await ventasQ.getMany();


  // ==== AGRUPADOR ====
  const agrupar = (items: any[], periodo: string, campo: string) => {
    const grouped = {};

    items.forEach((item) => {
      const key =
        periodo === 'dia'
          ? item.createdAt.toISOString().substring(11, 16) // HH:mm
          : periodo === 'mes'
          ? item.createdAt.toISOString().substring(8, 10)  // día
          : item.createdAt.toISOString().substring(5, 7);  // mes (01–12)

      grouped[key] = (grouped[key] || 0) + (item[campo] || 0);
    });

    return grouped;
  };


  // ==== SUMAS ====
  const egresosGrouped  = agrupar(gastos, filtro.periodo, 'amount');
  const ingresosGrouped = agrupar(ventas, filtro.periodo, 'total');
  const propinasGrouped = agrupar(ventas, filtro.periodo, 'propina');

  // ==== BALANCE (ingresos - egresos) ====
  const balanceGrouped = {};
  const claves = new Set([
    ...Object.keys(ingresosGrouped),
    ...Object.keys(egresosGrouped),
  ]);

  claves.forEach((k) => {
    balanceGrouped[k] =
      (ingresosGrouped[k] || 0) - (egresosGrouped[k] || 0);
  });


  // ==== RESPUESTA ====
  return {
    ingresos: ingresosGrouped,
    egresos: egresosGrouped,
    propinas: propinasGrouped,
    balance: balanceGrouped
  };
}



}
