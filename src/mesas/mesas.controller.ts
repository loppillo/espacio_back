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
} from '@nestjs/common';

import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { MesaService } from './mesas.service';
import { Mesa } from './entities/mesa.entity';
import { Order } from 'src/orders/entities/order.entity';

@Controller('mesas')
export class MesaController {
  constructor(private readonly mesaService: MesaService) {}

  @Get()
  findAll(): Promise<Mesa[]> {
    return this.mesaService.findAll();
  }

    @Get('/obtener/:id')
  async obtenerMesaPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.mesaService.obtenerMesaPorId(id);
  }

  @Get('/detalle/:id')
  async getDetalleMesa(@Param('id', ParseIntPipe) id: number): Promise<Mesa> {
    return this.mesaService.obtenerDetalleMesa(id);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Mesa> {
    return this.mesaService.findOne(id);
  }

  @Post()
  create(@Body() createMesaDto: CreateMesaDto): Promise<Mesa> {
    return this.mesaService.create(createMesaDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMesaDto: UpdateMesaDto,
  ): Promise<Mesa> {
    return this.mesaService.update(id, updateMesaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mesaService.remove(id);
  }

  @Put(':id/estado')
  async actualizarEstadoMesa(
    @Param('id') id: number,
    @Body('status') status: string,
  ) {
    return this.mesaService.actualizarEstadoMesa(id, status);
  }

  @Patch(':id/pagar')
async marcarPedidoPagado(@Param('id') mesaId: number) {
  return await this.mesaService.marcarPedidoPagado(mesaId);
}


  @Get(':id')
  getMesa(@Param('id') id: number): Promise<Mesa> {
    return this.mesaService.getMesa(id);
  }


 

  @Post(':id/nuevo-pedido')
  crearNuevoPedido(@Param('id') id: number): Promise<Order> {
    return this.mesaService.crearNuevoPedido(id);
  }

  @Get(':id/pedidos')
  getPedidosActuales(
    @Param('id') id: number,
    @Query('numeroVenta') numeroVenta: number,
  ): Promise<Order[]> {
    return this.mesaService.getPedidosActuales(id, numeroVenta);
  }


}
