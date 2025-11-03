import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateSOrderDto } from './dto/create.sorder';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Between, Raw, Repository } from 'typeorm';
import { PrintService } from './print/print.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, @InjectRepository(Order)
  private readonly orderRepository: Repository<Order>,
    private readonly printService: PrintService
  ) { }

  @Get('pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async obtenerPendientes() {
    return this.ordersService.obtenerPendientes();
  }


  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('historial/:mesaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getHistorialPorMesa(@Param('mesaId') mesaId: number) {
    console.log('🧩 Mesa ID recibido:', mesaId);
    return this.ordersService.getHistorialPorMesa(+mesaId);
  }


  @Post('s')
  @UseGuards(JwtAuthGuard, RolesGuard)
  creates(@Body() createOrderDto: CreateSOrderDto) {
    return this.ordersService.creates(createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  cancelarOrden(@Param('id') id: number) {
    return this.ordersService.cancelarOrden(id);
  }

  @Get('ventas/por-dia')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  async eliminarProducto(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.ordersService.eliminarProducto(orderId, productId);

  }

  @Post('imprimir/factura')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async print(@Body() body: any) {
    return this.printService.printFactura(body);
  }

  // Aceptar una venta (cambia status => 'Aceptado')
  @Patch(':id/aceptar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async aceptarVenta(@Param('id') id: number) {
    return this.ordersService.aceptarVenta(+id);
  }

  // Cancelar venta (opcional) - status => 'Cancelado' o 'Anulado'
  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async cancelarVenta(@Param('id') id: number) {
    return this.ordersService.cancelarVenta(+id);
  }

  @Get('ventas/diarias')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVentasDiarias(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('orderType') orderType?: string,
  ) {
    return this.ordersService.getVentasDiarias(desde, hasta, orderType);
  }

  @Get('ventas/diariasMesa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVentasDiariasxMesa(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('mesaId') mesaId?: number,
  ) {
    return this.ordersService.getVentasDiariasxMesa(desde, hasta, mesaId);
  }

  @Patch('cancelar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async cancelarVentas(
    @Query('fecha') fecha?: string, // formato YYYY-MM-DD
    @Query('mesaId') mesaId?: number,
  ) {
    if (!fecha && !mesaId) {
      throw new BadRequestException('Debe especificar al menos una fecha o una mesa.');
    }

    return this.ordersService.cancelarVentas(fecha, mesaId);
  }



  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async cancelar(@Param('id') id: number) {
    return this.ordersService.cancelar(id);
  }


}