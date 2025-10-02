import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { DeepPartial, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Propina } from 'src/propina/entities/propina.entity';
import { CreateSOrderDto } from './dto/create.sorder';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';


@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository:Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository:Repository<Customer>,
   @InjectRepository(Product)
    private readonly productRepository:Repository<Product>,
     @InjectRepository(Propina)
    private readonly propinaRepository:Repository<Propina>,
     @InjectRepository(Mesa)
    private readonly mesaRepository:Repository<Mesa>,

  ){}


async create(createOrderDto: CreateOrderDto) {
  const { products, propina, mesaId } = createOrderDto;

  // Validar mesa (si viene)
  let mesa = null;
  if (mesaId) {
    mesa = await this.mesaRepository.findOne({ where: { id: mesaId } });
    if (!mesa) {
      throw new BadRequestException('La mesa no se encuentra');
    }
  }

  // Obtener el último numeroVenta
  const lastOrder = await this.orderRepository.findOne({
    where: {},
    order: { id: 'DESC' },
  });
  const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;

  // Crear la orden base (sin productos todavía)
  const newOrder = this.orderRepository.create({
    detalle_venta: createOrderDto.detalle_venta,
    tableNumber: createOrderDto.tableNumber,
    propina,
    status: createOrderDto.status,
    orderType: createOrderDto.orderType,
    paymentMethod: createOrderDto.paymentMethod,
    mesa,
    numeroVenta: nextNumeroVenta,
    total: 0, // se recalcula más abajo
  });

  // Inicializar la lista de productos de la orden
  newOrder.orderProducts = [];

  let total = 0;

  for (const p of products) {
    // Buscar producto real en la DB
    const productEntity = await this.productRepository.findOne({ where: { id: p.id } });
    if (!productEntity) {
      throw new BadRequestException(`Producto con id ${p.id} no encontrado`);
    }

    // Calcular subtotal
    const subtotal = productEntity.price * p.cantidad;
    total += subtotal;

    // Crear relación pivot
    const orderProduct = new ProductsOrders();
    orderProduct.product = productEntity;
    orderProduct.cantidad = p.cantidad;
    orderProduct.precioUnitario = productEntity.price;
    orderProduct.subtotal = subtotal;

    newOrder.orderProducts.push(orderProduct);
  }

  // Actualizar el total de la orden
  newOrder.total = total + (propina || 0);

  // Guardar la orden con cascade → también guarda orderProducts
  return await this.orderRepository.save(newOrder);
}




async creates(createOrderDto: CreateSOrderDto) {
  const { products, customerId, newCustomer, propina } = createOrderDto;

  // 1️⃣ Validar o crear cliente
  let customer = null;
  if (customerId) {
    customer = await this.customerRepository.findOneBy({ id: customerId });
    if (!customer) throw new BadRequestException('El cliente no se encuentra');
  } else if (newCustomer) {
    customer = this.customerRepository.create(newCustomer as DeepPartial<Customer>);
    await this.customerRepository.save(customer);
  }

  // 2️⃣ Validar productos
  const productIds = products.map(p => p.id);
  const foundProducts = await this.productRepository.findBy({ id: In(productIds) });
  if (foundProducts.length !== productIds.length) {
    throw new BadRequestException('Uno o más productos no se encuentran');
  }

  // 3️⃣ Buscar último numeroVenta
  const lastOrder = await this.orderRepository.findOne({
    where: {},
    order: { id: 'DESC' },
  });
  const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;

  // 4️⃣ Crear la orden
  const newOrder = this.orderRepository.create({
    detalle_venta: createOrderDto.detalle_venta,
    status: createOrderDto.status || 'activo',
    orderType: createOrderDto.orderType || 'local',
    paymentMethod: createOrderDto.paymentMethod || 'pendiente',
    createdAt: new Date(),
    customer,
    propina: propina ?? 0,
    numeroVenta: nextNumeroVenta,
    orderProducts: [], // la llenamos abajo
  });

  // 5️⃣ Mapear productos a la tabla pivote ProductsOrders
  let total = 0;
  for (const p of products) {
    const productEntity = foundProducts.find(fp => fp.id === p.id);
    if (!productEntity) {
      throw new BadRequestException(`Producto con id ${p.id} no encontrado`);
    }

    const subtotal = productEntity.price * p.cantidad;
    total += subtotal;

    const orderProduct = new ProductsOrders();
    orderProduct.product = productEntity;
    orderProduct.cantidad = p.cantidad;
    orderProduct.precioUnitario = productEntity.price;
    orderProduct.subtotal = subtotal;

    newOrder.orderProducts.push(orderProduct);
  }

  // 6️⃣ Calcular total real (productos + propina)
  newOrder.total = total + (propina || 0);

  // 7️⃣ Guardar y devolver
  return await this.orderRepository.save(newOrder);
}


  async findAll() {
    return await this.orderRepository.find();
  }

  async findOne(id: number) {
    return await this.orderRepository.findOneBy({id});
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    return await this.orderRepository.update(id,updateOrderDto)
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
  async eliminarProducto(
  orderId: number,
  productId: number,
): Promise<{ message: string }> {
  const order = await this.orderRepository.findOne({
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
    // Si hay más de una unidad, se resta 1
    productOrder.cantidad -= 1;
    await this.orderRepository.save(order);
  } else {
    // Si solo queda una unidad, se elimina la relación
    order.orderProducts = order.orderProducts.filter(
      (op) => op.product.id !== productId,
    );
    await this.orderRepository.save(order);
  }

  return { message: 'Producto actualizado correctamente' };
}

}


