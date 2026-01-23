import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { Ingreso } from './entities/ingreso.entity';
import { CategoriaIngreso } from 'src/categoria_ingresos/entities/categoria_ingreso.entity';
import { ClienteIngreso } from 'src/clientes_ingresos/entities/cliente_ingreso.entity';

@Injectable()
export class IngresoService {
    constructor(
        @InjectRepository(Ingreso)
        private readonly ingresoRepository: Repository<Ingreso>,
        @InjectRepository(CategoriaIngreso)
        private readonly categoriaRepository: Repository<CategoriaIngreso>,
        @InjectRepository(ClienteIngreso)
        private readonly clienteRepository: Repository<ClienteIngreso>,
    ) { }

    async create(createIngresoDto: CreateIngresoDto) {
        const { categoriasIds, clientesIds, ...data } = createIngresoDto;

        const ingreso = this.ingresoRepository.create(data);

        if (categoriasIds && categoriasIds.length > 0) {
            ingreso.categorias = await this.categoriaRepository.findBy({ id: In(categoriasIds) });
        }

        if (clientesIds && clientesIds.length > 0) {
            ingreso.clientes = await this.clienteRepository.findBy({ id: In(clientesIds) });
        }

        return await this.ingresoRepository.save(ingreso);
    }

    async findAll() {
        return await this.ingresoRepository.find({
            relations: ['categorias', 'clientes', 'documentos'],
        });
    }

    async findOne(id: number) {
        const ingreso = await this.ingresoRepository.findOne({
            where: { id },
            relations: ['categorias', 'clientes', 'documentos'],
        });
        if (!ingreso) throw new NotFoundException(`Ingreso with ID ${id} not found`);
        return ingreso;
    }

    async update(id: number, updateIngresoDto: UpdateIngresoDto) {
        const ingreso = await this.findOne(id);
        const { categoriasIds, clientesIds, ...data } = updateIngresoDto;

        this.ingresoRepository.merge(ingreso, data);

        if (categoriasIds) {
            ingreso.categorias = await this.categoriaRepository.findBy({ id: In(categoriasIds) });
        }

        if (clientesIds) {
            ingreso.clientes = await this.clienteRepository.findBy({ id: In(clientesIds) });
        }

        return await this.ingresoRepository.save(ingreso);
    }

    async remove(id: number) {
        const ingreso = await this.findOne(id);
        return await this.ingresoRepository.remove(ingreso);
    }
}
