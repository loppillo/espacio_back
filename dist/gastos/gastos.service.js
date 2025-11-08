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
const order_entity_1 = require("../orders/entities/order.entity");
var Frecuencia;
(function (Frecuencia) {
    Frecuencia["DIARIO"] = "diario";
    Frecuencia["SEMANAL"] = "semanal";
    Frecuencia["MENSUAL"] = "mensual";
})(Frecuencia || (exports.Frecuencia = Frecuencia = {}));
let GastosService = class GastosService {
    constructor(expenseRepository, orderRepository, dataSource) {
        this.expenseRepository = expenseRepository;
        this.orderRepository = orderRepository;
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
    async getBalanceMensual(anio, mes) {
        const egresoRows = await this.expenseRepository.query(`
    SELECT 
      DAY(createdAt) AS dia,
      SUM(amount) AS egresos
    FROM expenses
    WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
    GROUP BY DAY(createdAt)
    `, [anio, mes]);
        const orderRows = await this.orderRepository.query(`
    SELECT
      DAY(createdAt) AS dia,
      SUM(total) AS ingresos,
      SUM(propina) AS propinas
    FROM orders
    WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
      AND status != 'cancelado'
    GROUP BY DAY(createdAt)
    `, [anio, mes]);
        const dias = Array.from({ length: 31 }, () => 0);
        const ingresos = Array.from({ length: 31 }, () => 0);
        const egresos = Array.from({ length: 31 }, () => 0);
        const propinas = Array.from({ length: 31 }, () => 0);
        const balance = Array.from({ length: 31 }, () => 0);
        egresoRows.forEach((r) => {
            const idx = r.dia - 1;
            egresos[idx] = Number(r.egresos || 0);
        });
        orderRows.forEach((r) => {
            const idx = r.dia - 1;
            ingresos[idx] = Number(r.ingresos || 0);
            propinas[idx] = Number(r.propinas || 0);
        });
        for (let i = 0; i < 31; i++) {
            balance[i] = ingresos[i] - egresos[i];
        }
        return { ingresos, egresos, propinas, balance };
    }
    async getBalanceAnual(anio) {
        const expRows = await this.expenseRepository.query(`
    SELECT 
      MONTH(createdAt) AS mes,
      SUM(CASE WHEN type = 'egreso' THEN amount ELSE 0 END) AS egresos
    FROM expenses
    WHERE YEAR(createdAt) = ?
    GROUP BY MONTH(createdAt)
    ORDER BY mes
    `, [anio]);
        const orderRows = await this.orderRepository.query(`
    SELECT
      MONTH(createdAt) AS mes,
      SUM(total) AS ingresos,
      SUM(propina) AS propinas
    FROM orders
    WHERE YEAR(createdAt) = ?
      AND status != 'cancelado'
    GROUP BY MONTH(createdAt)
    ORDER BY mes
    `, [anio]);
        const byMonth = {};
        expRows.forEach(r => {
            byMonth[r.mes] = { egresos: Number(r.egresos || 0), ingresos: 0, propinas: 0 };
        });
        orderRows.forEach(r => {
            if (!byMonth[r.mes]) {
                byMonth[r.mes] = { egresos: 0, ingresos: 0, propinas: 0 };
            }
            byMonth[r.mes].ingresos = Number(r.ingresos || 0);
            byMonth[r.mes].propinas = Number(r.propinas || 0);
        });
        return Object.entries(byMonth).map(([mes, d]) => ({
            mes: Number(mes),
            ingresos: d.ingresos,
            egresos: d.egresos,
            propinas: d.propinas,
            balance: d.ingresos - d.egresos,
        }));
    }
    async getBalancePorAnio(anio) {
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
            .andWhere("o.status = :status", { status: 'Pagado' })
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
    async estadisticas({ periodo, valor }) {
        let start;
        let end;
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
        const gastosRows = await this.expenseRepository
            .createQueryBuilder('g')
            .where('g.createdAt BETWEEN :start AND :end', { start, end })
            .andWhere('g.type = :t', { t: 'egreso' })
            .getMany();
        const orderRows = await this.orderRepository
            .createQueryBuilder('o')
            .where('o.createdAt BETWEEN :start AND :end', { start, end })
            .getMany();
        const groupKey = (d) => {
            if (periodo === 'dia')
                return d.toISOString().substring(11, 16);
            if (periodo === 'mes')
                return d.toISOString().substring(8, 10);
            return d.toISOString().substring(5, 7);
        };
        const gastos = {};
        const ingresos = {};
        const propinas = {};
        gastosRows.forEach((g) => {
            const k = groupKey(g.createdAt);
            gastos[k] = (gastos[k] || 0) + g.amount;
        });
        orderRows.forEach((o) => {
            const k = groupKey(o.createdAt);
            ingresos[k] = (ingresos[k] || 0) + o.total;
            propinas[k] = (propinas[k] || 0) + (o.propina || 0);
        });
        const labels = Array.from(new Set([...Object.keys(gastos), ...Object.keys(ingresos), ...Object.keys(propinas)])).sort();
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
};
exports.GastosService = GastosService;
exports.GastosService = GastosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gasto_entity_1.Gasto)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], GastosService);
//# sourceMappingURL=gastos.service.js.map