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
import { ProductsOrdersModule } from './products-orders/products-orders.module';
import { HorariosModule } from './horarios/horarios.module';
import { Horario } from './horarios/entities/horario.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { RolesGuard } from './roles/roles.guard';


@Module({
imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'usuario_node',
      password: 'siQA8Ew(wbaGEs',
      database: 'pub_app',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

 UsersModule, CategoriesModule,GastosModule, ProductsModule, OrdersModule, PropinaModule, CustomerModule, MesasModule, GastosModule, CategoriaGastoModule, AuthModule, ProductsOrdersModule, HorariosModule],
  controllers: [AppController],
  providers: [AppService, {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // primero JWT
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,   // luego Roles
    },],
})
export class AppModule {}
