import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Between, DataSource, DeepPartial, In, IsNull, MoreThan, Not, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Propina } from 'src/propina/entities/propina.entity';
import { CreateSOrderDto } from './dto/create.sorder';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { OrderDTO, OrdersGateway } from './orders.gateway';


@Injectable()
export class OrdersService {

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Propina)
    private readonly propinaRepository: Repository<Propina>,
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
    @InjectRepository(ProductsOrders)
    private readonly productsOrdersRepository: Repository<ProductsOrders>,
    private ordersGateway: OrdersGateway

  ) { }

async create(createOrderDto: CreateOrderDto) {
  const { products, propina = 0, mesaId, orderType = 'local' } = createOrderDto;

  // ✅ Validar mesa
  const mesa = await this.mesaRepository.findOne({ where: { id: Number(mesaId) } });
  if (!mesa) throw new BadRequestException('La mesa no existe');

  // ✅ Crear pedido base
  const newOrder = this.orderRepository.create({
    tableNumber: Number(mesa.numero_mesa),
    orderType,
    estado: 'activo',
    status: 'pendiente',
    paymentMethod: '', // ✅ ahora vacío
    propina,
    total: 0,
    numeroVenta: await this.generarNumeroVenta(),
    mesa,
  });

  // Guardar pedido base
  let savedOrder = await this.orderRepository.save(newOrder);

  // ✅ Obtener productos reales
  const productIds = products.map(p => p.id);
  const productEntities = await this.productRepository.findBy({ id: In(productIds) });

  if (productEntities.length !== products.length) {
    throw new BadRequestException('Uno o más productos no existen');
  }

  // ✅ Crear orderProducts
  let total = 0;

  const orderProducts = products.map(p => {
    const productEntity = productEntities.find(pe => pe.id === p.id)!;
    const subtotal = productEntity.price * p.cantidad;

    total += subtotal;

    return this.productsOrdersRepository.create({
      order: savedOrder,
      product: productEntity,
      cantidad: p.cantidad,
      precioUnitario: productEntity.price,
      subtotal,
    });
  });

  await this.productsOrdersRepository.save(orderProducts);

  // ✅ Total final
  savedOrder.total = total + propina;
  await this.orderRepository.save(savedOrder);

  // ✅ Actualizar mesa
  mesa.status = 'ocupada';
  await this.mesaRepository.save(mesa);

  // ✅ Recargar pedido completo
  const fullOrder = await this.orderRepository.findOne({
    where: { id: savedOrder.id },
    relations: ['customer', 'orderProducts', 'orderProducts.product', 'mesa'],
  });

  const sanitized = this.sanitizeOrder(fullOrder);

  // ✅ WebSocket
  Promise.resolve().then(() => {
    this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
    this.ordersGateway.notifyNewOrder(sanitized);
  });

  return sanitized;
}






async creates(createOrderDto: CreateSOrderDto) {
  const { products, propina = 0, orderType = 'delivery' } = createOrderDto;

  if (orderType !== 'delivery') {
    throw new BadRequestException('Este método solo permite pedidos de delivery.');
  }

  // ✅ Resolver cliente (nuevo o existente)
  let customer = null;

  if (createOrderDto.customerId) {
    // Buscar cliente existente
    customer = await this.customerRepository.findOne({
      where: { id: createOrderDto.customerId }
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
  }

  // ✅ Crear cliente nuevo si viene newCustomer
  if (!customer && createOrderDto.newCustomer) {
    const nc = createOrderDto.newCustomer;

    customer = this.customerRepository.create({
      customerName: nc.customerName,
      customerEmail: nc.customerEmail || null,
      customerAddress: nc.customerAddress || null,
      customerPhone: nc.customerPhone || null,
    });

    customer = await this.customerRepository.save(customer);
  }

  // Si no hay cliente, error
  if (!customer) {
    throw new BadRequestException('Debe proporcionar customerId o newCustomer');
  }

  // ✅ Número de venta
  const { max } = await this.orderRepository
    .createQueryBuilder('order')
    .select('MAX(order.numeroVenta)', 'max')
    .getRawOne();

  const nextNumeroVenta = (max || 0) + 1;

  // ✅ Crear pedido sin productos todavía
  const newOrder = this.orderRepository.create({
    detalle_venta: createOrderDto.detalle_venta,
    propina,
    status: createOrderDto.status || 'pendiente',
    orderType,
    paymentMethod: createOrderDto.paymentMethod || 'pendiente',
    numeroVenta: nextNumeroVenta,
    total: 0,
    customer,  // ✅ vínculo con el cliente
  });

  // ✅ Obtener productos reales
  const productIds = products.map(p => p.id);
  const productEntities = await this.productRepository.findBy({ id: In(productIds) });

  if (productEntities.length !== products.length) {
    throw new BadRequestException('Uno o más productos no existen');
  }

  // ✅ Construir orderProducts
  let total = 0;

  const orderProducts = products.map(p => {
    const productEntity = productEntities.find(pe => pe.id === p.id)!;
    const subtotal = productEntity.price * p.cantidad;

    total += subtotal;

    const op = new ProductsOrders();
    op.product = productEntity;
    op.cantidad = p.cantidad;
    op.precioUnitario = productEntity.price;
    op.subtotal = subtotal;
    op.order = newOrder;

    return op;
  });

  newOrder.total = total + propina;
  newOrder.orderProducts = orderProducts;

  // ✅ Guardar pedido completo
  const savedOrder = await this.orderRepository.save(newOrder);

  // ✅ Cargar con relaciones
  const fullOrder = await this.orderRepository.findOne({
    where: { id: savedOrder.id },
    relations: ['customer', 'orderProducts', 'orderProducts.product'],
  });

  const sanitized = this.sanitizeOrder(fullOrder);

  // WebSocket async
  Promise.resolve().then(() => {
    this.ordersGateway.notifyNewOrder(sanitized);
  });

  return sanitized;
}




async findAll() {
  return await this.orderRepository
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.orderProducts', 'orderProducts')
    .leftJoinAndSelect('orderProducts.product', 'product')
    .orderBy('product.price', 'ASC') // o 'DESC' si querés descendente
    .getMany();
}

  async findOne(id: number) {
    return await this.orderRepository.findOneBy({ id });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return await this.orderRepository.update(id, updateOrderDto)
  }

  async remove(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`La orden con ID ${id} no existe`);
    }

    // Soft delete (marcar como eliminado en deletedAt)
    await this.orderRepository.softRemove(order);

    return { message: 'Orden eliminada correctamente', id };
  }

  async cancelarOrden(id: number) {
    const orden = await this.orderRepository.findOneBy({ id });
    if (!orden) throw new NotFoundException('Orden no encontrada');

    orden.status = 'cancelado';
    return this.orderRepository.save(orden);
  }

  async getProductosPorMesa(mesaId: number): Promise<any[]> {
    // Traer todas las órdenes activas de la mesa con sus productos
    const orders = await this.orderRepository.find({
      where: { mesa: { id: mesaId }, estado: 'activo' },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!orders.length) {
      throw new NotFoundException('No se encontraron órdenes para esta mesa');
    }

    // Combinar productos de todas las órdenes, incluyendo orderId para luego eliminarlos si hace falta
    const productos = orders.flatMap(order =>
      order.orderProducts.map(op => ({
        orderId: order.id,
        productoId: op.product.id,
        nombre: op.product.name,
        precio: op.product.price,
        cantidad: op.cantidad,
      })),
    );

    return productos;
  }

  // Eliminar un producto de una orden específica
  async eliminarProducto(orderId: number, productId: number) {
    // 1️⃣ Buscar la relación producto-orden
    const orderProduct = await this.productsOrdersRepository.findOne({
      where: { orderId, productId },
      relations: ['product', 'order'],
    });

    if (!orderProduct) {
      throw new NotFoundException('El producto no está en la orden');
    }

    // 2️⃣ Eliminar el producto de la orden
    await this.productsOrdersRepository.delete({ orderId, productId });

    // 3️⃣ Obtener productos restantes
    const remainingProducts = await this.productsOrdersRepository.find({
      where: { orderId },
    });

    // 4️⃣ Recalcular total
    const newTotal = remainingProducts.reduce((sum, op) => sum + op.subtotal, 0);

    // 5️⃣ Opcional: actualizar status o propina si no quedan productos
    const updatedOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts'],
    });

    updatedOrder.total = newTotal;
    if (remainingProducts.length === 0) {
      updatedOrder.status = 'vacío'; // o 'cancelado', según tu lógica
      updatedOrder.propina = 0;
    }

    await this.orderRepository.save(updatedOrder);

    // 6️⃣ Devolver la orden actualizada completa
    return updatedOrder;
  }

  async getHistorialPorMesa(mesaId: number) {
    const pedidos = await this.orderRepository.find({
      where: { mesaId }, // ✅ usa la columna directa
      relations: ['orderProducts', 'orderProducts.product'],
      order: { createdAt: 'DESC' },
    });

    if (!pedidos.length) {
      console.warn('⚠️ No se encontraron pedidos para la mesa', mesaId);
      return [];
    }

    return pedidos.map(pedido => {
      const totalProductos = pedido.orderProducts.reduce((sum, op) => sum + op.subtotal, 0);
      return {
        numeroVenta: pedido.numeroVenta,
        mesaId: pedido.mesaId,
        status: pedido.status,
        estado: pedido.estado,
        createdAt: pedido.createdAt,
        propina: pedido.propina,
        totalProductos,
        totalPedido: totalProductos + (pedido.propina || 0),
        products: pedido.orderProducts.map(op => ({
          id: op.product.id,
          nombre: op.product.name,
          cantidad: op.cantidad,
          precio: op.precioUnitario,
          subtotal: op.subtotal,
        })),
      };
    });
  }


async obtenerPendientes(): Promise<Order[]> {
  const orders = await this.orderRepository
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.mesa', 'mesa')
    .leftJoinAndSelect('order.customer', 'customer')
    .leftJoinAndSelect('order.orderProducts', 'orderProducts')
    .leftJoinAndSelect('orderProducts.product', 'product')
    .where('order.status = :status', { status: 'pendiente' })
    .orderBy('order.createdAt', 'ASC')
    .getMany();

  // Mostrar los primeros 4 pedidos si existen
orders.forEach((order, index) => {
  console.log(`🔥 Pedido ${index + 1}: ID=${order.id}, Mesa=${order.mesa?.numero_mesa}, Total=${order.total}, Status=${order.status}`);
  order.orderProducts.forEach(op => {
    console.log(`   - ${op.cantidad} x ${op.product.name} = ${op.subtotal}`);
  });
});

  return orders;
}


  async aceptarVenta(orderId: number): Promise<Order> {
  const order = await this.orderRepository.findOne({
    where: { id: orderId },
    relations: ['mesa']
  });

  if (!order) throw new NotFoundException('Pedido no encontrado');

  // Si aceptar = pagar, entonces lo marcas como pagado
  order.status = 'pagado';
  order.paymentMethod = order.paymentMethod ?? 'efectivo'; // o lo que uses
  await this.orderRepository.save(order);

  const mesa = order.mesa;
  if (mesa) {
    mesa.status = 'Libre';
    await this.mesaRepository.save(mesa);
    this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
  }

  return order;
}


  async cancelarVenta(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['mesa'], // ✅ Para traer la mesa asociada
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    // ✅ Cambiar estado del pedido
    order.status = 'Cancelado';
    await this.orderRepository.save(order);

    // ✅ Verificamos si hay mesa asociada
    if (order.mesa) {
      order.mesa.status = 'Disponible'; // ✅ Liberar mesa
      await this.mesaRepository.save(order.mesa);
    }

    return order;
  }

  async getVentasDiarias(desde?: string, hasta?: string, orderType?: string) {
    let inicio: Date;
    let fin: Date;

    if (!desde && !hasta) {
      const hoy = new Date();
      inicio = new Date(hoy.setHours(0, 0, 0, 0));
      fin = new Date(hoy.setHours(23, 59, 59, 999));
    } else {
      inicio = new Date(desde);
      fin = new Date(hasta);
    }

    // 🧾 1️⃣ Totales generales
    const totalesQuery = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'total_ventas')
      .addSelect('COUNT(order.id)', 'cantidad_pedidos')
      .where('order.status = :status', { status: 'Pagado' })
      .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });

    if (orderType) {
      totalesQuery.andWhere('order.orderType = :orderType', { orderType });
    }

    const totales = await totalesQuery.getRawOne();

    // 📊 2️⃣ Ventas agrupadas por hora (para Chart.js)
    const graficoQuery = this.orderRepository
      .createQueryBuilder('order')
      .select("DATE_FORMAT(order.createdAt, '%H:00')", 'hora')
      .addSelect('SUM(order.total)', 'total')
      .where('order.status = :status', { status: 'Pagado' })
      .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin })
      .groupBy('hora')
      .orderBy('hora', 'ASC');

    if (orderType) {
      graficoQuery.andWhere('order.orderType = :orderType', { orderType });
    }

    const grafico = await graficoQuery.getRawMany();

    // 🧾 3️⃣ Detalle de ventas individuales (para la tabla)
    const detallesQuery = this.orderRepository
      .createQueryBuilder('order')
      .select([
        'order.id AS id',
        'order.total AS total',
        'order.orderType AS orderType',
        'order.paymentMethod AS paymentMethod',
        'order.createdAt AS createdAt',
        'mesa.numero_mesa AS numero_mesa',
      ])
      .leftJoin('order.mesa', 'mesa')
      .where('order.status = :status', { status: 'Pagado' })
      .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin })
      .orderBy('order.createdAt', 'DESC');

    if (orderType) {
      detallesQuery.andWhere('order.orderType = :orderType', { orderType });
    }

    const detalles = await detallesQuery.getRawMany();

    // 📋 4️⃣ Respuesta final
    return {
      totalVentas: Number(totales?.total_ventas || 0),
      cantidadPedidos: Number(totales?.cantidad_pedidos || 0),
      rango: { desde: inicio, hasta: fin },
      grafico,
      detalles,
    };
  }

  async getVentasDiariasxMesa(desde?: string, hasta?: string, mesaId?: number) {
    let inicio: Date;
    let fin: Date;

    if (!desde && !hasta) {
      const hoy = new Date();
      inicio = new Date(hoy.setHours(0, 0, 0, 0));
      fin = new Date(hoy.setHours(23, 59, 59, 999));
    } else {
      inicio = new Date(desde);
      fin = new Date(hasta);
    }

    const query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.mesa', 'mesa')
      .where('order.status = :status', { status: 'Pagado' })
      .andWhere('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });

    if (mesaId) query.andWhere('order.mesaId = :mesaId', { mesaId });

    const ventas = await query
      .select([
        'order.id AS id',
        'order.total AS total',
        'order.orderType AS tipo',
        'order.paymentMethod AS metodo',
        'mesa.numero_mesa AS mesa',
        'order.createdAt AS fecha',
      ])
      .orderBy('order.createdAt', 'DESC')
      .getRawMany();

    return ventas;
  }

  // 🔹 Cancelar ventas
  async cancelarVentas(fecha?: string, mesaId?: number) {
    const query = this.orderRepository.createQueryBuilder('order')
      .update()
      .set({ status: 'Cancelado' });

    if (fecha) {
      const inicio = new Date(`${fecha}T00:00:00`);
      const fin = new Date(`${fecha}T23:59:59`);
      query.where('order.createdAt BETWEEN :inicio AND :fin', { inicio, fin });
    }

    if (mesaId) {
      if (fecha) {
        query.andWhere('order.mesaId = :mesaId', { mesaId });
      } else {
        query.where('order.mesaId = :mesaId', { mesaId });
      }
    }

    const result = await query.execute();

    return {
      message: 'Ventas canceladas correctamente',
      afectadas: result.affected,
    };
  }

  async cancelar(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException('La venta no existe');
    }

    if (order.status === 'Cancelado') {
      throw new BadRequestException('La venta ya está cancelada');
    }

    order.status = 'Cancelado';
    await this.orderRepository.save(order);

    return { message: `Venta ${id} cancelada correctamente` };
  }



  private sanitizeOrder(order: Order): any {
  if (!order) return null;

  return {
    id: order.id,
    tableNumber: order.tableNumber ?? null,
    orderType: order.orderType ?? 'local',
    detalle_venta: order.detalle_venta ?? null,
    estado: order.estado ?? 'activo',
    propina: order.propina ?? 0,
    status: order.status ?? 'pendiente',
    total: order.total ?? 0,
    createdAt: order.createdAt ?? new Date(),
    paymentMethod: order.paymentMethod ?? 'pendiente',
    numeroVenta: order.numeroVenta ?? null,

    // Mesa simplificada
    mesaId: order.mesa?.id ?? null,
    mesa: order.mesa
      ? {
          id: order.mesa.id,
          numero_mesa: order.mesa.numero_mesa,
          status: order.mesa.status,
        }
      : null,

    // Cliente
    customer: order.customer
      ? {
          id: order.customer.id,
          name: order.customer.customerName,
          email: order.customer.customerEmail,
          phone: order.customer.customerPhone,
        }
      : null,

    // Productos
   items: order.orderProducts?.map(op => ({
  name: op.product.name,
  cantidad: op.cantidad,
  precio: op.precioUnitario,
  subtotal: op.subtotal,
  imageUrl: op.product.imageUrl ?? null,
})) ?? [],
    };
  }


private async generarNumeroVenta(): Promise<number> {
  const { max } = await this.orderRepository
    .createQueryBuilder('order')
    .select('MAX(order.numeroVenta)', 'max')
    .getRawOne();

  return (max || 0) + 1;
}

  
async getById(id: number) {
  const order = await this.orderRepository.findOne({
    where: { id },
    relations: {
      orderProducts: {
        product: true,
      },
      customer: true,
      mesa: true,
    }
  });

  if (!order) {
    throw new NotFoundException('Pedido no encontrado');
  }

  return order;
}

}