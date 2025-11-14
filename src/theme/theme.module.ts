import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';
import { Theme } from './entities/theme.entity';
import { OrdersGateway } from 'src/orders/orders.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Theme])],
  controllers: [ThemeController,OrdersGateway],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}
