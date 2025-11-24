import { Order } from 'src/orders/entities/order.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  full_name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  tipo_usuario: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  order: Order[];
}
