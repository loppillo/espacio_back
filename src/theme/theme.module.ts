import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { Theme } from './entities/theme.entity';
import { OrdersGateway } from 'src/orders/orders.gateway';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([Theme]),OrdersModule],
  controllers: [ThemeController,OrdersGateway],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}
