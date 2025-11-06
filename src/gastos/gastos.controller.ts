import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { Gasto } from './entities/gasto.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('gastos')
export class GastosController {
 constructor(private readonly expensesService: GastosService) {}

   @Get('estadisticas')
async estadisticas(
  @Query('type') type?: 'ingreso' | 'egreso',
  @Query('periodo') periodo?: 'dia' | 'mes' | 'anio',
  @Query('valor') valor?: string, // ej: 2025-11-05, 2025-11, 2025
) {
  return this.expensesService.estadisticas({ type, periodo, valor });
}


   @Get('balances')
  async getBalance(
    @Query('start') startDate?: string,
    @Query('end') endDate?: string
  ) {
    return this.expensesService.getBalancePorFecha(startDate, endDate);
  }


    @Get('balancesA')
  async getBalancePorAnio(@Query('anio') anio?: number) {
    return this.expensesService.getBalancePorAnio(anio);
  }

  @Get('ventas-diarias')
  async getBalanceDiario(@Query('fecha') fecha: string) {
    if (!fecha) {
      throw new BadRequestException('La fecha es requerida en formato YYYY-MM-DD');
    }
    return this.expensesService.getBalanceDiario(fecha);
  }

   @Get('mensual')
  getMensual(@Query('anio', ParseIntPipe) anio: number) {
    return this.expensesService.getBalanceMensual(anio);
  }

  @Get('anual')
  getAnual() {
    return this.expensesService.getBalanceAnual();
  }

  @Get()
  getAll(): Promise<Gasto[]> {
    return this.expensesService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number): Promise<Gasto> {
    return this.expensesService.findOne(id);
  }

  @Post()
  async crearGasto(@Body() body: Partial<Gasto>): Promise<Gasto> {
    return await this.expensesService.crearGastoManual(body);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.expensesService.remove(id);
  }


 
}

