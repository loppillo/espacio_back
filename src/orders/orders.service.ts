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
  const { products, propina = 0, mesaId, orderType } = createOrderDto;

  return await this.dataSource.transaction(async (manager) => {
    let mesa = null;

    // ✅ Validar mesa solo si no es delivery
    if (orderType !== 'delivery') {
      if (!mesaId || isNaN(Number(mesaId))) {
        throw new BadRequestException('La mesa es obligatoria');
      }

      mesa = await manager.findOne(Mesa, { where: { id: Number(mesaId) } });
      if (!mesa) throw new BadRequestException('La mesa no se encuentra');
      if (mesa.status === 'ocupada') {
        throw new BadRequestException('⛔ La mesa está ocupada.');
      }

      mesa.status = 'ocupada';
      await manager.save(mesa);
    }

    // ✅ Obtener correlativo venta
    const { max } = await manager
      .createQueryBuilder(Order, 'order')
      .select('MAX(order.numeroVenta)', 'max')
      .getRawOne();
    const nextNumeroVenta = (max || 0) + 1;

    // ✅ Crear orden base
    const newOrder = manager.create(Order, {
      detalle_venta: createOrderDto.detalle_venta,
      tableNumber: orderType !== 'delivery' ? createOrderDto.tableNumber : null,
      propina,
      status: createOrderDto.status || 'pendiente',
      orderType,
      paymentMethod: createOrderDto.paymentMethod || 'pendiente',
      mesa,
      numeroVenta: nextNumeroVenta,
      total: 0,
    });

    // ✅ Cargar productos en lote
    const productIds = products.map(p => p.id);
    const productEntities = await manager.find(Product, { where: { id: In(productIds) } });

    if (productEntities.length !== products.length) {
      throw new BadRequestException('Uno o más productos no existen');
    }

    // ✅ Generar detalles de orden
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

    // ✅ Guardar orden completa
    const savedOrder = await manager.save(Order, newOrder);

    // ✅ Recargar con relaciones necesarias
    const fullOrder = await manager.findOne(Order, {
      where: { id: savedOrder.id },
      relations: ['mesa', 'customer', 'orderProducts', 'orderProducts.product'],
    });

    const sanitized = this.sanitizeOrder(fullOrder);

    // 🔔 Notificar websockets (fuera del flujo principal)
    setImmediate(() => {
      if (mesa) this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
      this.ordersGateway.notifyNewOrder(sanitized);
    });

    return sanitized;
  });
}






async creates(createOrderDto: CreateSOrderDto) {
  const { products, customerId, newCustomer, propina = 0 } = createOrderDto;

  // ✅ 1. Validar o crear cliente
  let customer = null;

  if (customerId) {
    customer = await this.customerRepository.findOneBy({ id: customerId });
    if (!customer) throw new BadRequestException('El cliente no se encuentra');
  } else if (newCustomer) {
    if (!newCustomer.customerName?.trim()) {
      throw new BadRequestException('El nombre del cliente es obligatorio');
    }

    customer = this.customerRepository.create({
      customerName: newCustomer.customerName.trim(),
      customerEmail: newCustomer.customerEmail || '',
      customerAddress: newCustomer.customerAddress || '',
      customerPhone: newCustomer.customerPhone || '',
    });

    await this.customerRepository.save(customer);
  }

  // ✅ 2. Buscar productos en lote
  const productIds = products.map(p => p.id);
  const productEntities = await this.productRepository.findBy({ id: In(productIds) });

  if (productEntities.length !== products.length) {
    throw new BadRequestException('Uno o más productos no se encuentran');
  }

  // ✅ 3. Obtener correlativo venta
  const { max } = await this.orderRepository
    .createQueryBuilder('order')
    .select('MAX(order.numeroVenta)', 'max')
    .getRawOne();
  const nextNumeroVenta = (max || 0) + 1;

  // ✅ 4. Crear orden base
  const newOrder = this.orderRepository.create({
    detalle_venta: createOrderDto.detalle_venta,
    status: createOrderDto.status || 'pendiente',
    orderType: createOrderDto.orderType || 'delivery',
    paymentMethod: createOrderDto.paymentMethod || 'pendiente',
    customer,
    propina,
    numeroVenta: nextNumeroVenta,
    total: 0,
  });

  // ✅ 5. Generar productos asociados (sin bucle secuencial)
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

  // ✅ 6. Guardar orden completa
  const savedOrder = await this.orderRepository.save(newOrder);

  // ✅ 7. Recargar con relaciones necesarias
  const fullOrder = await this.orderRepository.findOne({
    where: { id: savedOrder.id },
    relations: ['customer', 'orderProducts', 'orderProducts.product'],
  });

  const sanitized = this.sanitizeOrder(fullOrder);

  // ✅ 8. Emitir evento WebSocket sin bloquear
  setImmediate(() => this.ordersGateway.notifyNewOrder(sanitized));

  return sanitized;
}


  async findAll() {
    return await this.orderRepository.find();
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
    return await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.mesa', 'mesa')
      .leftJoinAndSelect('order.customer', 'customer') // ✅ Cliente Delivery
      .leftJoinAndSelect('order.orderProducts', 'orderProducts')
      .leftJoinAndSelect('orderProducts.product', 'product')
      .where('order.status = :status', { status: 'pendiente' })
      .orderBy('order.createdAt', 'ASC')
      .getMany();
  }

  async aceptarVenta(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['mesa'] // Relación con la mesa
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    // Marcar pedido como Pagado
    order.status = 'Pagado';
    await this.orderRepository.save(order);

    // Actualizar status de la mesa
    const mesa = order.mesa;
    if (mesa) {
      // Revisar si hay otros pedidos activos en la mesa
      const pedidosActivos = await this.orderRepository.count({
        where: { mesaId: mesa.id, status: 'Activo' }
      });
      mesa.status = pedidosActivos > 0 ? 'Ocupada' : 'Libre';
      await this.mesaRepository.save(mesa);

      // Emitir evento para frontend
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



  private sanitizeOrder(order: Order): OrderDTO {
    return {
      id: order.id,
      tableNumber: order.tableNumber ?? null,
      orderType: order.orderType,
      detalle_venta: order.detalle_venta ?? null,
      estado: order.estado,
      propina: order.propina,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod ?? null,
      numeroVenta: order.numeroVenta,
      mesa: order.mesa
        ? { id: order.mesa.id, numero_mesa: order.mesa.numero_mesa }
        : null,
      customer: order.customer
        ? {
          id: order.customer.id,
          name: order.customer.customerName,
          email: order.customer.customerEmail,
          phone: order.customer.customerPhone,
        }
        : null,
      products: order.orderProducts?.map(op => ({
        productId: op.product.id,
        name: op.product.name,
        cantidad: op.cantidad,
        precioUnitario: op.precioUnitario,
        subtotal: op.subtotal,
        imageUrl: op.product.imageUrl ?? undefined,
      })) || [],
    };
  }



}