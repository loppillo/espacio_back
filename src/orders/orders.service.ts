import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Propina } from 'src/propina/entities/propina.entity';
import { CreateSOrderDto } from './dto/create.sorder';
import { Mesa } from 'src/mesas/entities/mesa.entity';


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
  const { productIds, propina, mesaId } = createOrderDto;

  // Validar productos (si vienen)
  let products = [];
  if (productIds && productIds.length > 0) {
    products = await this.productRepository.findByIds(productIds);
    if (products.length !== productIds.length) {
      throw new BadRequestException('Uno o más productos no se encuentran');
    }
  }

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
    where: {}, // 👈 obligatorio en TypeORM 0.3.x
    order: { id: 'DESC' },
  });
  const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;

  const newOrder = this.orderRepository.create({
    detalle_venta: createOrderDto.detalle_venta,
    tableNumber: createOrderDto.tableNumber,
    cantidad: createOrderDto.cantidad,
    total: createOrderDto.total,
    products,
    propina: propina,
    status: createOrderDto.status,
    orderType: createOrderDto.orderType,
    paymentMethod: createOrderDto.paymentMethod,
    mesa: mesa,
    numeroVenta: nextNumeroVenta,
  });

  return await this.orderRepository.save(newOrder);
}




async creates(createOrderDto: CreateSOrderDto) {
  const { productIds, customerId, newCustomer } = createOrderDto;

  // Validar o crear cliente
  let customer = null;
  if (customerId) {
    customer = await this.customerRepository.findOneBy({ id: customerId });
    if (!customer) {
      throw new BadRequestException('El cliente no se encuentra');
    }
  } else if (newCustomer) {
    customer = this.customerRepository.create(newCustomer);
    await this.customerRepository.save(customer);
  }

  // Validar productos
  let products = [];
  if (productIds && productIds.length > 0) {
    products = await this.productRepository.findByIds(productIds);
    if (products.length !== productIds.length) {
      throw new BadRequestException('Uno o más productos no se encuentran');
    }
  }

  const lastOrder = await this.orderRepository.findOne({
    where: {}, // 👈 obligatorio en TypeORM 0.3.x
    order: { id: 'DESC' },
  });

 const nextNumeroVenta = (lastOrder?.numeroVenta || 0) + 1;

  const newOrder = this.orderRepository.create({
    cantidad:createOrderDto.cantidad,
    tableNumber: createOrderDto.tableNumber,
    total: createOrderDto.total,
    status: createOrderDto.status,
    orderType: createOrderDto.orderType,
    paymentMethod: createOrderDto.paymentMethod,
    createdAt: new Date(),
    products,
    customer,
    propina: createOrderDto.propina,
    numeroVenta: nextNumeroVenta
  });

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
      relations: ['products'],
    });

    if (!orders.length) {
      throw new NotFoundException('No se encontraron órdenes para esta mesa');
    }

    // Combinar todos los productos, agregando el orderId para eliminar después
    const productos = orders.flatMap(order =>
      order.products.map(p => ({ ...p, orderId: order.id })),
    );

    return productos;
  }

  // Eliminar un producto de una orden específica
  async eliminarProducto(orderId: number, productId: number): Promise<{ message: string }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['products'],
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    order.products = order.products.filter(p => p.id !== +productId);
    await this.orderRepository.save(order);

    return { message: 'Producto eliminado correctamente' };
  }

}


