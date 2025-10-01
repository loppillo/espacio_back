import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { Mesa } from './entities/mesa.entity';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class MesaService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,

    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<Mesa[]> {
    return this.mesaRepository.find({ relations: ['orders'] });
  }
  
async findOne(id: number): Promise<Mesa> {
  return this.mesaRepository.findOne({
    where: { id },
    order: { numero_mesa: 'ASC' }, // ✅ usa un campo válido
  });
}

  async create(createMesaDto: CreateMesaDto): Promise<Mesa> {
    const mesa = this.mesaRepository.create(createMesaDto);
    return this.mesaRepository.save(mesa);
  }

  async update(id: number, updateMesaDto: UpdateMesaDto): Promise<Mesa> {
    const mesa = await this.findOne(id);
    Object.assign(mesa, updateMesaDto);
    return this.mesaRepository.save(mesa);
  }

  async remove(id: number): Promise<void> {
    const mesa = await this.findOne(id);
    await this.mesaRepository.remove(mesa);
  }

  async obtenerMesaPorId(id: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({
      where: { id },
      relations: ['orders', 'products'], // si quieres traer relaciones
    });

    if (!mesa) {
      throw new NotFoundException(`La mesa con ID ${id} no existe`);
    }

    return mesa;
  }

    async actualizarEstadoMesa(id: number, status: string) {
    const mesa = await this.mesaRepository.findOne({ where: { id } });
    if (!mesa) {
      throw new NotFoundException('Mesa no encontrada');
    }

    mesa.status = status; // asegúrate que tu entidad tenga este campo
    return await this.mesaRepository.save(mesa);
  }

  async obtenerDetalleMesa(id: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({
      where: { id },
      relations: ['orders'],  // cargar los orders relacionados
    });

    if (!mesa) {
      throw new NotFoundException(`Mesa con id ${id} no encontrada`);
    }
    return mesa;
  }

async marcarPedidoPagado(mesaId: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({
      where: { id: mesaId },
      relations: ['orders'],
    });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');

    if (mesa.orders && mesa.orders.length > 0) {
      mesa.orders.forEach(order => (order.status = 'Pagado'));
      await this.ordersRepository.save(mesa.orders);
    }

    mesa.status = 'Libre';
    mesa.orders = [];
    return this.mesaRepository.save(mesa);
  }

  async getMesa(mesaId: number): Promise<Mesa> {
    const mesa = await this.mesaRepository.findOne({
      where: { id: mesaId },
    });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');
    return mesa;
  }

async crearNuevoPedido(mesaId: number): Promise<Order> {
  // Buscar la mesa
  const mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
  if (!mesa) throw new NotFoundException('Mesa no encontrada');

  // Obtener el último numeroVenta
  const lastOrder = await this.ordersRepository.findOne({
    where: {},
    order: { id: 'DESC' },
  });
  const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;

  // Crear la orden inicial (sin productos)
  const pedido = this.ordersRepository.create({
    tableNumber: Number(mesa.numero_mesa),
    propina: 0,
    numeroVenta: nextNumeroVenta,
    status: 'Activo',
    total: 0,
    orderType: 'default',
    orderProducts: [] // inicializar array vacío
  });

  // Actualizar estado de la mesa
  mesa.status = 'Ocupada';
  await this.mesaRepository.save(mesa);

  // Guardar la orden en la base de datos
  return await this.ordersRepository.save(pedido);
}

    async getPedidosActuales(mesaId: number, numeroVenta: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { mesa: { id: mesaId }, numeroVenta },
    });
  }

  async getProductosPorMesa(mesaId: number): Promise<any[]> {
  // Traer todas las órdenes activas de la mesa con sus productos
  const orders = await this.ordersRepository.find({
    where: { mesa: { id: mesaId }, estado: 'activo' },
    relations: ['orderProducts', 'orderProducts.product'],
  });

  if (!orders.length) {
    throw new NotFoundException('No se encontraron órdenes para esta mesa');
  }

  // Combinar todos los productos de todas las órdenes
  const productos = orders.flatMap(order =>
    order.orderProducts.map(op => ({
      orderId: order.id,
      productoId: op.product.id,
      nombre: op.product.name,   // asumiendo que en Product tienes "nombre"
      cantidad: op.cantidad,
      precioUnitario: op.precioUnitario,
      subtotal: op.subtotal,
    })),
  );

  return productos;
}


  // Eliminar un producto de una orden específica
 async eliminarProducto(
  orderId: number,
  productId: number,
): Promise<{ message: string }> {
  const order = await this.ordersRepository.findOne({
    where: { id: orderId },
    relations: ['orderProducts', 'orderProducts.product'],
  });

  if (!order) {
    throw new NotFoundException('Orden no encontrada');
  }

  // Buscar la relación producto-orden
  const productOrder = order.orderProducts.find(
    (op) => op.product.id === productId,
  );

  if (!productOrder) {
    throw new NotFoundException(
      `El producto con id ${productId} no está en la orden`,
    );
  }

  if (productOrder.cantidad > 1) {
    // Si hay más de una unidad, restamos 1
    productOrder.cantidad -= 1;
    await this.ordersRepository.save(order);
  } else {
    // Si solo queda 1 unidad, quitamos la relación
    order.orderProducts = order.orderProducts.filter(
      (op) => op.product.id !== productId,
    );
    await this.ordersRepository.save(order);
  }

  return { message: 'Producto eliminado correctamente' };
}

}