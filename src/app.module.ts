import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PropinaModule } from './propina/propina.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerModule } from './customer/customer.module';
import { MesasModule } from './mesas/mesas.module';
import { GastosModule } from './gastos/gastos.module';
import { CategoriaGastoModule } from './categoria-gasto/categoria-gasto.module';
import { AuthModule } from './auth/auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '162.241.60.177',
      port: 3306,
      username: 'vuelveal_rest2',
      password: 'V#s7EtE)z.74',
      database: 'vuelveal_restaurant',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    
    UsersModule, CategoriesModule,GastosModule, ProductsModule, OrdersModule, PropinaModule, CustomerModule, MesasModule, GastosModule, CategoriaGastoModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
