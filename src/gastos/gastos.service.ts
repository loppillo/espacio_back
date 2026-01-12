import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { ProveedoresService } from 'src/proveedores/proveedores.service';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { Gasto } from './entities/gasto.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, getManager } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Eta } from 'src/eta/entities/eta.entity';
import { RangoFechaDto } from './dto/rango-fecha.dto';
import { UsersService } from 'src/users/users.service';

// Alias para la entidad de categoria_gasto
type CategoriaGasto = any;


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
    @InjectRepository(ProductsOrders)
    private readonly productsOrdersRepository: Repository<ProductsOrders>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Eta)
    private readonly etaRepository: Repository<Eta>,
    private readonly proveedoresService: ProveedoresService,
    private readonly usersService: UsersService,
    private dataSource: DataSource
  ) { }

 async findAll(user: any): Promise<Gasto[]> {
    // 1. Seguridad primero: Si no hay usuario, no devolvemos nada
    if (!user) return []; 

    // 2. Si es ADMIN, ve todo
    if (user.role === 'admin') {
      return this.expenseRepository.find({
        relations: ['proveedor', 'users']
      });
    } 
    
    // 3. Si es GARZÓN, ve solo lo suyo
    if (user.role === 'garzon') {
      return this.expenseRepository.find({
        where: {
          users: { id: user.id } // Asegúrate que la relación en la Entity se llame 'users'
        },
        relations: ['proveedor', 'users']
      });
    }

    // 4. IMPORTANTE: Para cualquier otro caso (roles nuevos, errores, etc.),
    // devuelve un array vacío por seguridad.
    return [];
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

  async create(expenseData: any): Promise<Gasto> {

    // Si viene proveedorId, buscamos la entidad
    let proveedor = null;
    if (expenseData.proveedorId) {
      proveedor = await this.proveedoresService.findOne(expenseData.proveedorId);
    }

    let users = [];
    if (expenseData.userId) {
      const user = await this.usersService.findOne(expenseData.userId);
      if (user) {
        users.push(user);
      }
    }

    const expense = this.expenseRepository.create({
      ...expenseData,
      proveedor: proveedor,
      users: users
    }) as unknown as Gasto;
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

  // ==========================================
  // CONTABILIDAD - FINANZAS
  // ==========================================

  async getKpisFinanzas(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    // Ingresos (orders)
    const ingresosResult = await entityManager
      .createQueryBuilder()
      .select("SUM(o.total)", "total")
      .from("orders", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.status = :status", { status: 'Pagado' })
      .getRawOne();

    // Egresos (expenses)
    const egresosResult = await entityManager
      .createQueryBuilder()
      .select("SUM(e.amount)", "total")
      .from("expenses", "e")
      .where("e.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("e.type = :type", { type: 'egreso' })
      .getRawOne();

    // Propinas
    const propinasResult = await entityManager
      .createQueryBuilder()
      .select("SUM(o.propina)", "total")
      .from("orders", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.status = :status", { status: 'Pagado' })
      .getRawOne();

    const ingresos = Number(ingresosResult?.total || 0);
    const egresos = Number(egresosResult?.total || 0);
    const propinas = Number(propinasResult?.total || 0);
    const balance = ingresos - egresos;

    // Por cobrar (orders con status pendiente)
    const porCobrarResult = await entityManager
      .createQueryBuilder()
      .select("SUM(o.total)", "total")
      .from("orders", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.status != :status", { status: 'Pagado' })
      .getRawOne();

    return {
      ingresos,
      egresos,
      propinas,
      balance,
      porCobrar: Number(porCobrarResult?.total || 0)
    };
  }

  async getBalanceDias(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        DATE(o.createdAt) as fecha,
        SUM(CASE WHEN o.status = 'Pagado' THEN o.total ELSE 0 END) as ingresos,
        0 as egresos,
        SUM(CASE WHEN o.status = 'Pagado' THEN o.propina ELSE 0 END) as propinas
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
      GROUP BY DATE(o.createdAt)
      ORDER BY fecha ASC
      `,
      [start, end]
    );

    // Obtener egresos por fecha
    const egresosRows = await entityManager.query(
      `
      SELECT 
        DATE(e.createdAt) as fecha,
        SUM(e.amount) as egresos
      FROM expenses e
      WHERE e.createdAt BETWEEN ? AND ?
        AND e.type = 'egreso'
      GROUP BY DATE(e.createdAt)
      ORDER BY fecha ASC
      `,
      [start, end]
    );

    // Fusionar datos
    const egresosMap = new Map(egresosRows.map(r => [r.fecha, Number(r.egresos || 0)]));

    const result = rows.map(r => {
      const balance = Number(r.ingresos || 0) - Number(egresosMap.get(r.fecha) || 0);
      return {
        fecha: r.fecha,
        ingresos: Number(r.ingresos || 0),
        egresos: Number(egresosMap.get(r.fecha) || 0),
        propinas: Number(r.propinas || 0),
        balance
      };
    });

    return {
      labels: result.map(r => r.fecha),
      ingresos: result.map(r => r.ingresos),
      egresos: result.map(r => r.egresos),
      propinas: result.map(r => r.propinas),
      balance: result.map(r => r.balance)
    };
  }

  async getEvolucion(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
    SELECT 
      DATE(o.createdAt) as fecha,
      
      -- 1. Suma de ingresos (Pagados)
      SUM(CASE WHEN o.status = 'Pagado' THEN o.total ELSE 0 END) - 
      
      -- 2. Resta de egresos (Usamos MAX porque el valor viene repetido por el JOIN, no queremos sumarlo N veces)
      COALESCE(MAX(e.total_egresos), 0) as balance,
      
      -- 3. Por cobrar
      SUM(CASE WHEN o.status != 'Pagado' THEN o.total ELSE 0 END) as porCobrar
      
    FROM orders o
    
    -- UNIR CON GASTOS PRE-CALCULADOS
    LEFT JOIN (
      SELECT 
        DATE(createdAt) as fecha_gasto, 
        SUM(amount) as total_egresos 
      FROM expenses 
      WHERE type = 'egreso'
      GROUP BY DATE(createdAt)
    ) e ON e.fecha_gasto = DATE(o.createdAt)

    WHERE o.createdAt BETWEEN ? AND ?
    GROUP BY DATE(o.createdAt)
    ORDER BY fecha ASC
    `,
      [start, end]
    );

    return {
      labels: rows.map(r => this.formatDay(r.fecha)),
      balance: rows.map(r => Number(r.balance || 0)),
      porCobrar: rows.map(r => Number(r.porCobrar || 0))
    };
  }
  async getTopDias(rango: RangoFechaDto, limit = 5) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        DATE(o.createdAt) as fecha,
        SUM(o.total) as recaudacion
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY DATE(o.createdAt)
      ORDER BY recaudacion DESC
      LIMIT ?
      `,
      [start, end, limit]
    );

    return rows.map(r => ({
      dia: this.formatDay(r.fecha),
      recaudacion: Number(r.recaudacion || 0)
    }));
  }

  async getDistribucion(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const result = await entityManager.query(
      `
      SELECT 
        SUM(CASE WHEN o.status = 'Pagado' THEN o.total ELSE 0 END) as ingresos,
        SUM(CASE WHEN o.status = 'Pagado' THEN o.propina ELSE 0 END) as propinas
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
      `,
      [start, end]
    );

    return {
      ingresos: Number(result[0]?.ingresos || 0),
      propinas: Number(result[0]?.propinas || 0)
    };
  }

  // ==========================================
  // CONTABILIDAD - MESAS
  // ==========================================

  async getIngresosPorMesa(rango: RangoFechaDto, limit = 10) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        m.numero_mesa as mesa,
        SUM(o.total) as ingresos
      FROM orders o
      INNER JOIN mesa m ON o.mesaId = m.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY m.id, m.numero_mesa
      ORDER BY ingresos DESC
      LIMIT ?
      `,
      [start, end, limit]
    );

    return rows.map(r => ({
      mesa: r.mesa || `Mesa ${r.mesa}`,
      ingresos: Number(r.ingresos || 0)
    }));
  }

  async getHorasPuntaPorMesa(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        HOUR(o.createdAt) as hora,
        COUNT(*) as ocupacion
      FROM orders o
      INNER JOIN mesa m ON o.mesaId = m.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY HOUR(o.createdAt)
      ORDER BY hora ASC
      `,
      [start, end]
    );

    return rows.map(r => ({
      hora: r.hora,
      ocupacion: Number(r.ocupacion || 0)
    }));
  }

  // ==========================================
  // CONTABILIDAD - PRODUCTOS
  // ==========================================

  async getTopProductos(rango: RangoFechaDto, limit = 10) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        p.name as producto,
        SUM(po.cantidad) as unidades,
        SUM(po.subtotal) as total
      FROM orders o
      INNER JOIN order_products po ON o.id = po.orderId
      INNER JOIN products p ON po.productId = p.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY p.id, p.name
      ORDER BY total DESC
      LIMIT ?
      `,
      [start, end, limit]
    );

    return rows.map(r => ({
      producto: r.producto,
      unidades: Number(r.unidades || 0),
      total: Number(r.total || 0)
    }));
  }

  async getIngresosPorCategoria(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT
        c.nombre as categoria,
        SUM(po.subtotal) as ingresos
      FROM orders o
      INNER JOIN order_products po ON o.id = po.orderId
      INNER JOIN products p ON po.productId = p.id
      INNER JOIN products_categories pc ON p.id = pc.product_id
      INNER JOIN categories c ON pc.category_id = c.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY c.id, c.nombre
      ORDER BY ingresos DESC
      `,
      [start, end]
    );

    return rows.map(r => ({
      categoria: r.categoria,
      ingresos: Number(r.ingresos || 0)
    }));
  }

  // ==========================================
  // CONTABILIDAD - CLIENTES
  // ==========================================

  async getKpisClientes(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    // Total clientes únicos en el rango
    const totalResult = await entityManager
      .createQueryBuilder()
      .select("COUNT(DISTINCT o.customerId)", "total")
      .from("orders", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.status = :status", { status: 'Pagado' })
      .getRawOne();

    // Clientes nuevos (primer pedido en el rango)
    const nuevosResult = await entityManager.query(
      `
      SELECT COUNT(DISTINCT o.customerId) as nuevos
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
        AND o.customerId NOT IN (
          SELECT DISTINCT o2.customerId
          FROM orders o2
          WHERE o2.createdAt < ?
            AND o2.status = 'Pagado'
        )
      `,
      [start, end, start]
    );

    // Clientes recurrentes
    const recurrentesResult = await entityManager.query(
      `
      SELECT COUNT(DISTINCT o.customerId) as recurrentes
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
        AND o.customerId IN (
          SELECT DISTINCT o2.customerId
          FROM orders o2
          WHERE o2.createdAt < ?
            AND o2.status = 'Pagado'
        )
      `,
      [start, end, start]
    );

    return {
      total: Number(totalResult?.total || 0),
      nuevos: Number(nuevosResult[0]?.nuevos || 0),
      recurrentes: Number(recurrentesResult[0]?.recurrentes || 0)
    };
  }

  async getNuevosRecurrentes(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);

    const kpis = await this.getKpisClientes(rango);

    return {
      nuevos: kpis.nuevos,
      recurrentes: kpis.recurrentes
    };
  }

  async getActividadClientes(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    // Por día de la semana
    const rows = await entityManager.query(
      `
      SELECT 
        DAYNAME(o.createdAt) as dia,
        COUNT(DISTINCT o.customerId) as clientes
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY DAYNAME(o.createdAt)
      ORDER BY FIELD(dia, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
      `,
      [start, end]
    );

    return {
      labels: rows.map(r => this.translateDay(r.dia)),
      nuevos: rows.map(r => Math.floor(Number(r.clientes || 0) * 0.3)),
      recurrentes: rows.map(r => Math.floor(Number(r.clientes || 0) * 0.7))
    };
  }

  async getTopClientesGasto(rango: RangoFechaDto, limit = 10) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        c.customerName as cliente,
        SUM(o.total) as gasto
      FROM orders o
      INNER JOIN customer c ON o.customerId = c.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY o.customerId, c.customerName
      ORDER BY gasto DESC
      LIMIT ?
      `,
      [start, end, limit]
    );

    return rows.map(r => ({
      cliente: r.cliente || 'Anónimo',
      gasto: Number(r.gasto || 0)
    }));
  }

  async getTopClientesPedidos(rango: RangoFechaDto, limit = 10) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        c.customerName as cliente,
        COUNT(o.id) as pedidos
      FROM orders o
      INNER JOIN customer c ON o.customerId = c.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY o.customerId, c.customerName
      ORDER BY pedidos DESC
      LIMIT ?
      `,
      [start, end, limit]
    );

    return rows.map(r => ({
      cliente: r.cliente || 'Anónimo',
      pedidos: Number(r.pedidos || 0)
    }));
  }

  async getFrecuenciaClientes(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const result = await entityManager.query(
      `
      SELECT 
        AVG(o.total) as ticketPromedio
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      `,
      [start, end]
    );

    const ticketPromedio = Number(result[0]?.ticketPromedio || 0);

    const frecuenciaRows = await entityManager.query(
      `
      SELECT 
        COUNT(*) as numPedidos,
        COUNT(DISTINCT o.customerId) as clientes
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.status = 'Pagado'
      GROUP BY o.customerId
      ORDER BY numPedidos DESC
      `,
      [start, end]
    );

    return {
      ticketPromedio,
      frecuenciaPorNumPedidos: frecuenciaRows.map(r => ({
        numPedidos: Number(r.numPedidos || 0),
        clientes: Number(r.clientes || 0)
      }))
    };
  }

  // ==========================================
  // CONTABILIDAD - DELIVERY
  // ==========================================

  async getKpisDelivery(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    // Pedidos totales
    const pedidosResult = await entityManager
      .createQueryBuilder()
      .select("COUNT(*)", "total")
      .from("orders", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.orderType = :type", { type: 'delivery' })
      .getRawOne();

    const pedidosTotales = Number(pedidosResult?.total || 0);

    // Pagados
    const pagadosResult = await entityManager
      .createQueryBuilder()
      .select("COUNT(*)", "total")
      .from("orders", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.orderType = :type", { type: 'delivery' })
      .andWhere("o.status = :status", { status: 'Pagado' })
      .getRawOne();

    // Pendientes
    const pendientesResult = await entityManager
      .createQueryBuilder()
      .select("COUNT(*)", "total")
      .from("orders", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.orderType = :type", { type: 'delivery' })
      .andWhere("o.status != :status", { status: 'Pagado' })
      .getRawOne();

    // Recaudado
    const recaudadoResult = await entityManager
      .createQueryBuilder()
      .select("SUM(o.total)", "total")
      .from("orders", "o")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.orderType = :type", { type: 'delivery' })
      .andWhere("o.status = :status", { status: 'Pagado' })
      .getRawOne();

    // Tiempo promedio desde eta_requests
    const tiempoResult = await entityManager
      .createQueryBuilder()
      .select("AVG(e.eta_min)", "promedio")
      .from("eta_requests", "e")
      .innerJoin("orders", "o", "e.order_id = o.id")
      .where("o.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("o.orderType = :type", { type: 'delivery' })
      .getRawOne();

    // Puntualidad (entregas a tiempo vs total)
    const puntualidadRows = await entityManager.query(
      `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN e.eta_min <= 30 THEN 1 ELSE 0 END) as puntuales
      FROM eta_requests e
      INNER JOIN orders o ON e.order_id = o.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.orderType = 'delivery'
      `,
      [start, end]
    );

    const totalPedidos = Number(puntualidadRows[0]?.total || 0);
    const puntuales = Number(puntualidadRows[0]?.puntuales || 0);
    const puntualidad = totalPedidos > 0 ? (puntuales / totalPedidos) * 100 : 0;

    return {
      pedidos: pedidosTotales,
      pagados: Number(pagadosResult?.total || 0),
      pendientes: Number(pendientesResult?.total || 0),
      tiempoPromedio: Math.round(Number(tiempoResult?.promedio || 0)),
      puntualidad: Math.round(puntualidad),
      recaudado: Number(recaudadoResult?.total || 0)
    };
  }

  async getPedidosDeliveryPorDia(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        DATE(o.createdAt) as fecha,
        COUNT(*) as pedidos
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.orderType = 'delivery'
      GROUP BY DATE(o.createdAt)
      ORDER BY fecha ASC
      `,
      [start, end]
    );

    return {
      labels: rows.map(r => r.fecha),
      pedidos: rows.map(r => Number(r.pedidos || 0))
    };
  }

  async getTiempoDespacho(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        DATE(o.createdAt) as fecha,
        AVG(e.eta_min) as tiempoPromedio
      FROM eta_requests e
      INNER JOIN orders o ON e.order_id = o.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.orderType = 'delivery'
      GROUP BY DATE(o.createdAt)
      ORDER BY fecha ASC
      `,
      [start, end]
    );

    return {
      labels: rows.map(r => r.fecha),
      tiempoPromedio: rows.map(r => Math.round(Number(r.tiempoPromedio || 0)))
    };
  }

  async getEstadosDelivery(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        o.status,
        COUNT(*) as total
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.orderType = 'delivery'
      GROUP BY o.status
      `,
      [start, end]
    );

    return {
      pagado: rows.find(r => r.status === 'Pagado')?.total || 0,
      pendiente: rows.find(r => r.status === 'pendiente')?.total || 0,
      cancelado: rows.find(r => r.status === 'cancelado')?.total || 0
    };
  }

  async getRecaudacionDelivery(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        DATE(o.createdAt) as fecha,
        SUM(o.total) as recaudacion
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.orderType = 'delivery'
        AND o.status = 'Pagado'
      GROUP BY DATE(o.createdAt)
      ORDER BY fecha ASC
      `,
      [start, end]
    );

    return {
      labels: rows.map(r => r.fecha),
      recaudacion: rows.map(r => Number(r.recaudacion || 0))
    };
  }

  async getClientesDelivery(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const result = await entityManager.query(
      `
      SELECT 
        COUNT(DISTINCT o.customerId) as total
      FROM orders o
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.orderType = 'delivery'
        AND o.status = 'Pagado'
      `,
      [start, end]
    );

    const total = Number(result[0]?.total || 0);

    return {
      nuevos: Math.floor(total * 0.3),
      recurrentes: Math.floor(total * 0.7)
    };
  }

  async getTopBarrios(rango: RangoFechaDto, limit = 10) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        e.barrio_sector as barrio,
        COUNT(*) as pedidos
      FROM eta_requests e
      INNER JOIN orders o ON e.order_id = o.id
      WHERE o.createdAt BETWEEN ? AND ?
        AND o.orderType = 'delivery'
      GROUP BY e.barrio_sector
      ORDER BY pedidos DESC
      LIMIT ?
      `,
      [start, end, limit]
    );

    return rows.map(r => ({
      barrio: r.barrio || 'Desconocido',
      pedidos: Number(r.pedidos || 0)
    }));
  }

  // ==========================================
  // CONTABILIDAD - GASTOS
  // ==========================================

  async getKpisGastos(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    // Total gastos
    const totalResult = await entityManager
      .createQueryBuilder()
      .select("SUM(e.amount)", "total")
      .from("expenses", "e")
      .where("e.createdAt BETWEEN :start AND :end", { start, end })
      .andWhere("e.type = :type", { type: 'egreso' })
      .getRawOne();

    // Por categoría
    const categoriaRows = await entityManager.query(
      `
      SELECT 
        cg.nombre as categoria,
        SUM(e.amount) as monto
      FROM expenses e
      INNER JOIN categorias_gasto cg ON e.categoriaId = cg.id
      WHERE e.createdAt BETWEEN ? AND ?
        AND e.type = 'egreso'
      GROUP BY cg.id, cg.nombre
      ORDER BY monto DESC
      LIMIT 1
      `,
      [start, end]
    );

    // Por medio de pago
    const medioRows = await entityManager.query(
      `
      SELECT 
        e.paymentMethod as medio,
        SUM(e.amount) as monto
      FROM expenses e
      WHERE e.createdAt BETWEEN ? AND ?
        AND e.type = 'egreso'
      GROUP BY e.paymentMethod
      ORDER BY monto DESC
      LIMIT 1
      `,
      [start, end]
    );

    return {
      total: Number(totalResult?.total || 0),
      categoriaTop: categoriaRows[0]?.categoria || null,
      categoriaTopMonto: Number(categoriaRows[0]?.monto || 0),
      medioTop: medioRows[0]?.medio || null,
      medioTopMonto: Number(medioRows[0]?.monto || 0)
    };
  }

  async getGastosPorCategoria(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT
        cg.nombre as categoria,
        SUM(e.amount) as monto
      FROM expenses e
      INNER JOIN categorias_gasto cg ON e.categoriaId = cg.id
      WHERE e.createdAt BETWEEN ? AND ?
        AND e.type = 'egreso'
      GROUP BY cg.id, cg.nombre
      ORDER BY monto DESC
      `,
      [start, end]
    );

    return rows.map(r => ({
      categoria: r.categoria,
      monto: Number(r.monto || 0)
    }));
  }

  async getGastosPorMedioPago(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        e.paymentMethod as medio,
        SUM(e.amount) as monto
      FROM expenses e
      WHERE e.createdAt BETWEEN ? AND ?
        AND e.type = 'egreso'
      GROUP BY e.paymentMethod
      ORDER BY monto DESC
      `,
      [start, end]
    );

    return rows.map(r => ({
      medio: r.medio,
      monto: Number(r.monto || 0)
    }));
  }

  async getEvolucionGastos(rango: RangoFechaDto) {
    const { start, end } = this.getRangoFechas(rango);
    const entityManager = this.dataSource.manager;

    const rows = await entityManager.query(
      `
      SELECT 
        DATE(e.createdAt) as fecha,
        SUM(e.amount) as gastos
      FROM expenses e
      WHERE e.createdAt BETWEEN ? AND ?
        AND e.type = 'egreso'
      GROUP BY DATE(e.createdAt)
      ORDER BY fecha ASC
      `,
      [start, end]
    );

    return {
      labels: rows.map(r => r.fecha),
      gastos: rows.map(r => Number(r.gastos || 0))
    };
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  private getRangoFechas(rango: RangoFechaDto): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (rango.start && rango.end) {
      start = new Date(rango.start);
      end = new Date(rango.end);
      // Ajustar la fecha final al final del día
      end.setHours(23, 59, 59, 999);
    } else {
      // Por defecto: mes actual
      const year = now.getFullYear();
      const month = now.getMonth();
      start = new Date(year, month, 1, 0, 0, 0);
      end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    }

    return { start, end };
  }

  private formatDay(fecha: string): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const date = new Date(fecha);
    return dias[date.getDay()];
  }

  private translateDay(dayName: string): string {
    const translations = {
      'Monday': 'Lun',
      'Tuesday': 'Mar',
      'Wednesday': 'Mié',
      'Thursday': 'Jue',
      'Friday': 'Vie',
      'Saturday': 'Sáb',
      'Sunday': 'Dom'
    };
    return translations[dayName] || dayName;
  }

  async estadisticas({ periodo, valor }: { periodo; valor }) {
    // rango según periodo
    let start: Date;
    let end: Date;

    if (periodo === 'dia') {
      start = new Date(`${valor}T00:00:00`);
      end = new Date(`${valor}T23:59:59`);
    }

    if (periodo === 'mes') {
      const [y, m] = valor.split('-');
      start = new Date(Number(y), Number(m) - 1, 1, 0, 0, 0);
      end = new Date(Number(y), Number(m), 0, 23, 59, 59);
    }

    if (periodo === 'anio') {
      const y = Number(valor);
      start = new Date(y, 0, 1, 0, 0, 0);
      end = new Date(y, 11, 31, 23, 59, 59);
    }

    // ---- QUERIES ----

    // GASTOS (egresos)
    const gastosRows = await this.expenseRepository
      .createQueryBuilder('g')
      .where('g.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('g.type = :t', { t: 'egreso' })
      .getMany();

    // ORDERS (ingresos)
    const orderRows = await this.orderRepository
      .createQueryBuilder('o')
      .where('o.createdAt BETWEEN :start AND :end', { start, end })
      .getMany();

    // ---- AGRUPAR POR LLAVE SEGÚN PERIODO ----
    const groupKey = (d: Date) => {
      if (periodo === 'dia') return d.toISOString().substring(11, 16);
      if (periodo === 'mes') return d.toISOString().substring(8, 10);
      return d.toISOString().substring(5, 7);
    };

    const gastos: Record<string, number> = {};
    const ingresos: Record<string, number> = {};
    const propinas: Record<string, number> = {};

    gastosRows.forEach((g) => {
      const k = groupKey(g.createdAt);
      gastos[k] = (gastos[k] || 0) + g.amount;
    });

    orderRows.forEach((o) => {
      const k = groupKey(o.createdAt);
      ingresos[k] = (ingresos[k] || 0) + o.total;
      propinas[k] = (propinas[k] || 0) + (o.propina || 0);
    });

    // ---- GENERAR LISTA DE LABELS ORDENADAS ----
    const labels = Array.from(
      new Set([...Object.keys(gastos), ...Object.keys(ingresos), ...Object.keys(propinas)])
    ).sort();

    // ---- ARMAR ARRAYS PARA GRAFICOS ----
    const arrIngresos = labels.map((l) => ingresos[l] || 0);
    const arrEgresos = labels.map((l) => gastos[l] || 0);
    const arrPropinas = labels.map((l) => propinas[l] || 0);
    const arrBalance = labels.map((_, idx) => arrIngresos[idx] - arrEgresos[idx]);

    return {
      labels,
      ingresos: arrIngresos,
      egresos: arrEgresos,
      propinas: arrPropinas,
      balance: arrBalance,
    };
  }







}
