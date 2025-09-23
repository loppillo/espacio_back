import { Customer } from 'src/customer/entities/customer.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { Product } from 'src/products/entities/product.entity';
import { Propina } from 'src/propina/entities/propina.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';


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

  @Column()
  cantidad:number;

  @Column({ type: 'varchar', default: 'activo' })
estado: string;

   @Column()
  propina:number;

  @Column()
  status: string;

  @Column('decimal')
  total: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  
@Column({ default: 'null' })
  paymentMethod:string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Customer, (customer) => customer.id)
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToMany(() => Product, { eager: true }) // optional: eager si quieres que siempre se cargue
    @JoinTable({
    name: 'order_products',
    joinColumn: { name: 'orderId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[];

  @ManyToOne(() => Mesa, (mesa) => mesa.id)
  @JoinColumn({ name: 'mesaId' })
  mesa: Mesa;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

   @Column()
  numeroVenta: number;
}
