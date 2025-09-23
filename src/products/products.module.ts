import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Category } from 'src/categories/entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Product]),TypeOrmModule.forFeature([Category]),TypeOrmModule.forFeature([Order])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
