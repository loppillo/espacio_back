import { Customer } from 'src/customer/entities/customer.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { ProductsOrders } from 'src/products-orders/entities/products-order.entity';
import { Product } from 'src/products/entities/product.entity';
import { Propina } from 'src/propina/entities/propina.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable, DeleteDateColumn, OneToMany } from 'typeorm';


@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  tableNumber: number;

  @Column()
  orderType:string;

  @Column({ type: 'text', nullable: true })
  detalle_venta:string;


  @Column({ type: 'varchar', default: 'activo' })
estado: string;

   @Column('int')
  propina:number;

  @Column()
  status: string;

  @Column('int')
  total: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  
@Column({ default: 'null' })
  paymentMethod:string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

@ManyToOne(() => Customer, (customer) => customer.id, { nullable: true })
@JoinColumn({ name: 'customerId' })
customer: Customer;

@OneToMany(() => ProductsOrders, productsOrders => productsOrders.order, { cascade: true, eager: true })
  orderProducts: ProductsOrders[];

  @ManyToOne(() => Mesa, (mesa) => mesa.id)
  @JoinColumn({ name: 'mesaId' })
  mesa: Mesa;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

   @Column()
  numeroVenta: number;
  
}
