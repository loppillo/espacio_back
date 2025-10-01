"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GastosService = exports.Frecuencia = void 0;
const common_1 = require("@nestjs/common");
const gasto_entity_1 = require("./entities/gasto.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
var Frecuencia;
(function (Frecuencia) {
    Frecuencia["DIARIO"] = "diario";
    Frecuencia["SEMANAL"] = "semanal";
    Frecuencia["MENSUAL"] = "mensual";
})(Frecuencia || (exports.Frecuencia = Frecuencia = {}));
let GastosService = class GastosService {
    constructor(expenseRepository, dataSource) {
        this.expenseRepository = expenseRepository;
        this.dataSource = dataSource;
    }
    findAll() {
        return this.expenseRepository.find();
    }
    async getBalancePorFecha(ingresosWhere, egresosWhere) {
        const entityManager = this.dataSource.manager;
        const ingresosQuery = entityManager
            .createQueryBuilder()
            .select("DATE(o.createdAt)", "fecha")
            .addSelect("SUM(o.total)", "ingresos")
            .addSelect("0", "egresos")
            .from("orders", "o");
        if (ingresosWhere && typeof ingresosWhere === 'object') {
            Object.entries(ingresosWhere).forEach(([key, value], index) => {
                if (value !== undefined &&
                    value !== null &&
                    !(typeof value === 'number' && Number.isNaN(value))) {
                    const paramName = `ingresoParam${index}`;
                    ingresosQuery.andWhere(`o.${key} = :${paramName}`, { [paramName]: value });
                }
            });
        }
        ingresosQuery.groupBy("DATE(o.createdAt)");
        const egresosQuery = entityManager
            .createQueryBuilder()
            .select("DATE(e.createdAt)", "fecha")
            .addSelect("0", "ingresos")
            .addSelect("SUM(e.amount)", "egresos")
            .from("expenses", "e");
        if (egresosWhere && typeof egresosWhere === 'object') {
            Object.entries(egresosWhere).forEach(([key, value], index) => {
                if (value !== undefined &&
                    value !== null &&
                    !(typeof value === 'number' && Number.isNaN(value))) {
                    const paramName = `egresoParam${index}`;
                    egresosQuery.andWhere(`e.${key} = :${paramName}`, { [paramName]: value });
                }
            });
        }
        egresosQuery.groupBy("DATE(e.createdAt)");
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
    findOne(id) {
        return this.expenseRepository.findOneBy({ id });
    }
    create(expenseData) {
        const expense = this.expenseRepository.create(expenseData);
        return this.expenseRepository.save(expense);
    }
    async remove(id) {
        await this.expenseRepository.delete(id);
    }
    async getBalanceMensual(anio) {
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
        }
        catch (error) {
            console.error('Error en getBalanceAnual:', error);
            throw new common_1.InternalServerErrorException('No se pudo obtener el balance anual');
        }
    }
    async getBalancePorAnio(anio) {
        const entityManager = this.dataSource.manager;
        const filtroOrders = anio
            ? `WHERE YEAR(o.createdAt) = ${anio} AND (o.status = 'vendido' OR o.status = 'pagado')`
            : `WHERE (o.status = 'vendido' OR o.status = 'pagado')`;
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
    async getBalanceDiario(fecha) {
        const entityManager = this.dataSource.manager;
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
            .andWhere("o.status = :status", { status: 'vendido' })
            .groupBy("fecha, p.name")
            .getRawMany();
        const egresos = await entityManager
            .createQueryBuilder()
            .select("DATE(e.createdAt)", "fecha")
            .addSelect("SUM(e.amount)", "totalEgresos")
            .from("expenses", "e")
            .where("DATE(e.createdAt) = :fecha", { fecha })
            .groupBy("fecha")
            .getRawOne();
        const agrupados = new Map();
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
    async crearGasto(g) {
        await this.expenseRepository.save({
            ...g,
            id: undefined,
            createdAt: new Date(),
        });
    }
    async crearGastoManual(data) {
        const gasto = this.expenseRepository.create(data);
        return await this.expenseRepository.save(gasto);
    }
};
exports.GastosService = GastosService;
exports.GastosService = GastosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gasto_entity_1.Gasto)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], GastosService);
//# sourceMappingURL=gastos.service.js.map