import { Module } from '@nestjs/common';
import { PropinaService } from './propina.service';
import { PropinaController } from './propina.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Propina } from './entities/propina.entity';
import { Order } from 'src/orders/entities/order.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Propina]),TypeOrmModule.forFeature([Order])],
  controllers: [PropinaController],
  providers: [PropinaService],
})
export class PropinaModule {}
