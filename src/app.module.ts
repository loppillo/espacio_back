import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PropinaModule } from './propina/propina.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
import { OrdersGateway } from './orders/orders.gateway';
import { ThemeModule } from './theme/theme.module';
import { MailModule } from './mail/mail.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en toda la app
      envFilePath: '.env', // Ruta al archivo .env
    }),
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
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // Usa process.cwd() para que funcione en producción
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        fallthrough: true,
      },
    }),
    UsersModule, CategoriesModule, GastosModule, ProductsModule, OrdersModule, PropinaModule, CustomerModule, MesasModule, GastosModule, CategoriaGastoModule, AuthModule, ProductsOrdersModule, HorariosModule, ThemeModule, MailModule],
  controllers: [AppController],
  providers: [AppService, OrdersGateway],
})
export class AppModule { }
