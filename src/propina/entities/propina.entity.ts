import { Order } from 'src/orders/entities/order.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';


@Entity('tips')
export class Propina {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  amount: number;

  @OneToOne(() => Order, order => order.propina, { cascade: true, eager: true })
  @JoinColumn() // Importante: sólo una de las dos entidades debe tener esto
  order:Order; 

}
