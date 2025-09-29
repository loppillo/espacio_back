import { Category } from 'src/categories/entities/category.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';


@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category)
  category: Category;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  price: number;

  
  @Column({ nullable: true })
  imageUrl: string;

  @OneToMany(()=>Order,(order)=>order.user)
  order:Order[];

}
