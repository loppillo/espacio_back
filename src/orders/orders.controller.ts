import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateSOrderDto } from './dto/create.sorder';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Between, Raw, Repository } from 'typeorm';
import { PrintService } from './print/print.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, @InjectRepository(Order)
  private readonly orderRepository: Repository<Order>,
    private readonly printService: PrintService
  ) { }

     @Get('pendientes')
  async obtenerPendientes() {
    return this.ordersService.obtenerPendientes();
  }


  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('historial/:mesaId')
async getHistorialPorMesa(@Param('mesaId') mesaId: number) {
  console.log('🧩 Mesa ID recibido:', mesaId);
  return this.ordersService.getHistorialPorMesa(+mesaId);
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




  @Delete(':orderId/productos/:productId')
  async eliminarProducto(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.ordersService.eliminarProducto(orderId, productId);

  }

  @Post('imprimir/factura')
  async print(@Body() body: any) {
    return this.printService.printFactura(body);
  }

  // Aceptar una venta (cambia status => 'Aceptado')
  @Patch(':id/aceptar')
  async aceptarVenta(@Param('id') id: number) {
    return this.ordersService.aceptarVenta(+id);
  }

  // Cancelar venta (opcional) - status => 'Cancelado' o 'Anulado'
  @Patch(':id/cancelar')
  async cancelarVenta(@Param('id') id: number) {
    return this.ordersService.cancelarVenta(+id);
  }

@Get('ventas/diarias')
async getVentasDiarias(
  @Query('desde') desde?: string,
  @Query('hasta') hasta?: string,
  @Query('orderType') orderType?: string, 
) {
  return this.ordersService.getVentasDiarias(desde, hasta, orderType);
}

@Get('ventas/diarias')
  async getVentasDiariasxMesa(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('mesaId') mesaId?: number,
  ) {
    return this.ordersService.getVentasDiariasxMesa(desde, hasta, mesaId);
  }

  @Patch('cancelar')
  async cancelarVentas(
    @Query('fecha') fecha?: string, // formato YYYY-MM-DD
    @Query('mesaId') mesaId?: number,
  ) {
    if (!fecha && !mesaId) {
      throw new BadRequestException('Debe especificar al menos una fecha o una mesa.');
    }

    return this.ordersService.cancelarVentas(fecha, mesaId);
  }


}