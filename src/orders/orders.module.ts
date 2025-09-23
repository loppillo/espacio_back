import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { Product } from 'src/products/entities/product.entity';
import { Mesa } from 'src/mesas/entities/mesa.entity';
import { Propina } from 'src/propina/entities/propina.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Order]),TypeOrmModule.forFeature([User]),TypeOrmModule.forFeature([Propina]),TypeOrmModule.forFeature([Customer]),TypeOrmModule.forFeature([Product]),
  TypeOrmModule.forFeature([Mesa])
],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
