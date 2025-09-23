import { Module } from '@nestjs/common';
import { GastosService } from './gastos.service';
import { GastosController } from './gastos.controller';
import { Gasto } from './entities/gasto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/customer/entities/customer.entity';
import { CategoriaGasto } from 'src/categoria-gasto/entities/categoria-gasto.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [TypeOrmModule.forFeature([Gasto,Customer,CategoriaGasto]),ScheduleModule.forRoot(),],
  controllers: [GastosController],
  providers: [GastosService],
})
export class GastosModule {}
