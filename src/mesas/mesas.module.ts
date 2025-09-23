import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MesaService } from './mesas.service';
import { MesaController } from './mesas.controller';
import { Mesa } from './entities/mesa.entity';
import { Order } from '../orders/entities/order.entity'; // Adjust the path as needed

@Module({
  imports:[TypeOrmModule.forFeature([Mesa]),TypeOrmModule.forFeature([Order])],
  controllers: [MesaController],
  providers: [MesaService],
})
export class MesasModule {}
