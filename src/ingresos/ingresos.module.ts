import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Ingreso } from './entities/ingreso.entity';
import { CategoriaIngreso } from 'src/categoria_ingresos/entities/categoria_ingreso.entity';
import { ClienteIngreso } from 'src/clientes_ingresos/entities/cliente_ingreso.entity';
import { DocumentoIngreso } from 'src/documentos_ingreso/entities/documento_ingreso.entity';
import { IngresoController } from './ingresos.controller';
import { IngresoService } from './ingresos.service';

@Module({
    imports: [TypeOrmModule.forFeature([Ingreso, CategoriaIngreso, ClienteIngreso, DocumentoIngreso])],
    controllers: [IngresoController],
    providers: [IngresoService],
    exports: [IngresoService],
})
export class IngresoModule { }
