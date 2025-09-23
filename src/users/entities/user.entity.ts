import { Order } from 'src/orders/entities/order.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profileImage: string;


  @Column({ nullable: true })
  role: string;

  @OneToMany(()=>Order,(order)=>order.user)
  order:Order[];
 

}
