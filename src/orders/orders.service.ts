import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Between, DeepPartial, In, IsNull, MoreThan, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Propina } from 'src/propina/entities/propina.entity';
import { CreateSOrderDto } from './dto/create.sorder';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { OrdersGateway } from './orders.gateway';


@Injectable()
export class OrdersService {

  constructor(
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
  const { products, propina, mesaId, orderType } = createOrderDto;

  // ✅ Si no es delivery, se requiere mesa válida
  if (orderType !== 'delivery') {
    if (!mesaId || isNaN(Number(mesaId))) {
      throw new BadRequestException('La mesa es obligatoria');
    }
  }

  let mesa = null;

  // ✅ Si es para mesa, validar y marcar como ocupada
  if (orderType !== 'delivery') {
    mesa = await this.mesaRepository.findOne({
      where: { id: Number(mesaId) },
    });

    if (!mesa) throw new BadRequestException('La mesa no se encuentra');

    if (mesa.status === 'ocupada') {
      throw new BadRequestException('⛔ La mesa está ocupada, no puedes agregar más productos.');
    }

    // ✅ Cambiar estado a ocupada
    mesa.status = 'ocupada';
    await this.mesaRepository.save(mesa);

    // ✅ Emitir actualización en tiempo real
    this.ordersGateway.notifyMesaUpdated(mesa.id, mesa.status);
  }

  // ✅ Obtener correlativo venta
  const lastOrder = await this.orderRepository.findOne({
    where: {},
    order: { id: 'DESC' },
  });
  const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;

  const newOrder = this.orderRepository.create({
    detalle_venta: createOrderDto.detalle_venta,
    tableNumber: orderType !== 'delivery' ? createOrderDto.tableNumber : null,
    propina,
    status: createOrderDto.status,
    orderType,
    paymentMethod: createOrderDto.paymentMethod,
    mesa,
    numeroVenta: nextNumeroVenta,
    total: 0,
  });

  newOrder.orderProducts = [];
  let total = 0;

  for (const p of products) {
    const productEntity = await this.productRepository.findOne({ where: { id: p.id } });
    if (!productEntity) throw new BadRequestException(`Producto con id ${p.id} no encontrado`);

    const subtotal = productEntity.price * p.cantidad;
    total += subtotal;

    const orderProduct = new ProductsOrders();
    orderProduct.product = productEntity;
    orderProduct.cantidad = p.cantidad;
    orderProduct.precioUnitario = productEntity.price;
    orderProduct.subtotal = subtotal;

    newOrder.orderProducts.push(orderProduct);
  }

  newOrder.total = total + (propina || 0);

  const savedOrder = await this.orderRepository.save(newOrder);

  // ✅ Emitir evento WebSocket de nueva orden
  this.ordersGateway.notifyNewOrder(savedOrder);

  return savedOrder;
}





  async creates(createOrderDto: CreateSOrderDto) {
  const { products, customerId, newCustomer, propina } = createOrderDto;

  // ✅ 1️⃣ Validar o crear cliente
  let customer = null;

  if (customerId) {
    customer = await this.customerRepository.findOneBy({ id: customerId });
    if (!customer) throw new BadRequestException('El cliente no se encuentra');
  } else if (newCustomer) {
    if (!newCustomer.customerName) {
      throw new BadRequestException('El nombre del cliente es obligatorio');
    }

    customer = this.customerRepository.create({
      customerName: newCustomer.customerName,
      customerEmail: newCustomer.customerEmail || '',
      customerAddress: newCustomer.customerAddress || '',
      customerPhone: newCustomer.customerPhone || '',
    });

    await this.customerRepository.save(customer);
  }

  // ✅ 2️⃣ Validar productos
  const productIds = products.map(p => p.id);
  const foundProducts = await this.productRepository.findBy({ id: In(productIds) });

  if (foundProducts.length !== productIds.length) {
    throw new BadRequestException('Uno o más productos no se encuentran');
  }

  // ✅ 3️⃣ Buscar último numeroVenta
  const lastOrder = await this.orderRepository.findOne({
    where: {},
    order: { id: 'DESC' },
  });
  const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;

  // ✅ 4️⃣ Crear Orden sin guardar aún
  const newOrder = this.orderRepository.create({
    detalle_venta: createOrderDto.detalle_venta,
    status: createOrderDto.status || 'activo',
    orderType: createOrderDto.orderType || 'local',
    paymentMethod: createOrderDto.paymentMethod || 'pendiente',
    customer,
    propina: propina ?? 0,
    numeroVenta: nextNumeroVenta,
    orderProducts: [],
  });

  let total = 0;

  // ✅ 5️⃣ Mapear productos correctamente
  for (const p of products) {
    const productEntity = foundProducts.find(fp => fp.id === p.id);
    const subtotal = productEntity.price * p.cantidad;
    total += subtotal;

    const orderProduct = new ProductsOrders();
    orderProduct.product = productEntity;
    orderProduct.cantidad = p.cantidad;
    orderProduct.precioUnitario = productEntity.price;
    orderProduct.subtotal = subtotal;

    // 🔥 Necesario para que TypeORM lo guarde correctamente
    orderProduct.order = newOrder;

    newOrder.orderProducts.push(orderProduct);
  }

  // ✅ 6️⃣ Total final
  newOrder.total = total + (propina || 0);

  // ✅ 7️⃣ Guardar primero y luego notificar el evento
  const savedOrder = await this.orderRepository.save(newOrder);

  // 🔥 Notificar **después** de grabar correctamente
  this.ordersGateway.notifyNewOrder(savedOrder);

  return savedOrder;
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
    const order = await this.orderRepository.findOne({ where: { id: orderId }});
    if (!order) throw new NotFoundException('Pedido no encontrado');
    order.status = 'Pagado';
    return await this.orderRepository.save(order);
  }

  async cancelarVenta(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId }});
    if (!order) throw new NotFoundException('Pedido no encontrado');
    order.status = 'Cancelado';
    return await this.orderRepository.save(order);
  }



}