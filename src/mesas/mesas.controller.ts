import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { MesaService } from './mesas.service';
import { Mesa } from './entities/mesa.entity';
import { Order } from 'src/orders/entities/order.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('mesas')
export class MesaController {
  constructor(private readonly mesaService: MesaService) {}
  @Get(':id/detalle-actual')
  @UseGuards(JwtAuthGuard, RolesGuard)
async getDetalleMesaActual(@Param('id', ParseIntPipe) id: number) {
  return this.mesaService.obtenerDetalleMesaActual(id);
}


    @Get('historial')
    @UseGuards(JwtAuthGuard, RolesGuard)
async getHistorialPorMesas(@Query('mesaId', ParseIntPipe) mesaId: number) {
  return this.mesaService.getPedidosPorMesa(mesaId);
}


  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(): Promise<Mesa[]> {
    return this.mesaService.findAll();
  }

    @Get('/obtener/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerMesaPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.mesaService.obtenerMesaPorId(id);
  }

  @Get('/detalle/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDetalleMesa(@Param('id', ParseIntPipe) id: number): Promise<Mesa> {
    return this.mesaService.obtenerDetalleMesa(id);
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Mesa> {
    return this.mesaService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createMesaDto: CreateMesaDto): Promise<Mesa> {
    return this.mesaService.create(createMesaDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMesaDto: UpdateMesaDto,
  ): Promise<Mesa> {
    return this.mesaService.update(id, updateMesaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mesaService.remove(id);
  }

  @Put(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async actualizarEstadoMesa(
    @Param('id') id: number,
    @Body('status') status: string,
  ) {
    return this.mesaService.actualizarEstadoMesa(id, status);
  }

  @Patch(':id/pagar')
  @UseGuards(JwtAuthGuard, RolesGuard)
async marcarPedidoPagado(@Param('id') mesaId: number) {
  return await this.mesaService.marcarPedidoPagado(mesaId);
}


  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getMesa(@Param('id') id: number): Promise<Mesa> {
    return this.mesaService.getMesa(id);
  }


 

  @Post(':id/nuevo-pedido')
  @UseGuards(JwtAuthGuard, RolesGuard)
  crearNuevoPedido(@Param('id') id: number): Promise<Order> {
    return this.mesaService.crearNuevoPedido(id);
  }

  @Get(':id/pedidos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getPedidosActuales(
    @Param('id') id: number,
    @Query('numeroVenta') numeroVenta: number,
  ): Promise<Order[]> {
    return this.mesaService.getPedidosActuales(id, numeroVenta);
  }

@Get('ventas/detalle-mesa')
@UseGuards(JwtAuthGuard, RolesGuard)
async getDetalleMesas(
  @Query('mesaId') mesaId: number,
  @Query('fecha') fecha?: string,
) {
  return this.mesaService.getMesaDetail(mesaId, fecha);
}




}