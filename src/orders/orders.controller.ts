import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateSOrderDto } from './dto/create.sorder';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Raw, Repository } from 'typeorm';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, @InjectRepository(Order)
      private readonly orderRepository:Repository<Order>,) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post('s')
  creates(@Body() createOrderDto: CreateSOrderDto) {
    return this.ordersService.creates(createOrderDto);
  }


  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Patch(':id/cancelar')
  cancelarOrden(@Param('id') id: number) {
  return this.ordersService.cancelarOrden(id);
}

@Get('ventas/por-dia')
async obtenerVentasPorDia(@Query('fecha') fecha: string) {
  if (!fecha) {
    throw new BadRequestException('Debe proporcionar una fecha en formato YYYY-MM-DD');
  }

  const ordenes = await this.orderRepository.find({
    where: {
      createdAt: Raw(alias => `DATE(${alias}) = :fecha`, { fecha })
    },
    order: { id: 'DESC' }
  });

  const ordenesConTotal = ordenes.map(orden => ({
    id: orden.id,
    fecha: orden.createdAt,
    status: orden.status,
    total: orden.total
  }));

  return ordenesConTotal;
}


@Get('mesas/:mesaId/productos')
  async getProductosPorMesa(@Param('mesaId') mesaId: number) {
    return this.ordersService.getProductosPorMesa(+mesaId);
  }

  @Delete(':orderId/productos/:productId')
async eliminarProducto(
  @Param('orderId', ParseIntPipe) orderId: number,
  @Param('productId', ParseIntPipe) productId: number,
) {
  return this.ordersService.eliminarProducto(orderId, productId);

}

}