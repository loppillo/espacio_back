import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';
import { Ingreso } from './entities/ingreso.entity';
import { CategoriaIngreso } from 'src/categoria_ingresos/entities/categoria_ingreso.entity';
import { ClienteIngreso } from 'src/clientes_ingresos/entities/cliente_ingreso.entity';
import { DocumentoIngreso } from 'src/documentos_ingreso/entities/documento_ingreso.entity';

@Injectable()
export class IngresoService {
    constructor(
        @InjectRepository(Ingreso)
        private readonly ingresoRepository: Repository<Ingreso>,
        @InjectRepository(CategoriaIngreso)
        private readonly categoriaRepository: Repository<CategoriaIngreso>,
        @InjectRepository(ClienteIngreso)
        private readonly clienteRepository: Repository<ClienteIngreso>,
        @InjectRepository(DocumentoIngreso)
        private readonly documentoRepository: Repository<DocumentoIngreso>,
    ) { }

 async create(createIngresoDto: CreateIngresoDto) {
    const { categoriasIds, clientesIds, documentoId, ...data } = createIngresoDto;

    // 1. Instanciar el ingreso base
    const ingreso = this.ingresoRepository.create(data);

    // 2. Cargar relaciones (Promise.all para hacerlo en paralelo y ganar velocidad)
    const [categorias, clientes] = await Promise.all([
        categoriasIds?.length ? this.categoriaRepository.findBy({ id: In(categoriasIds) }) : [],
        clientesIds?.length ? this.clienteRepository.findBy({ id: In(clientesIds) }) : []
    ]);

    ingreso.categorias = categorias;
    ingreso.clientes = clientes;

    // 3. Lógica del Documento (OneToOne)
    if (documentoId) {
        const documento = await this.documentoRepository.findOneBy({ id: documentoId });
        if (!documento) {
             // Opcional: Lanzar error si el ID enviado no existe
             // throw new NotFoundException('Documento no encontrado');
        } else {
            // Asumiendo que renombraste la propiedad en la entidad a 'documento'
            ingreso.documento = documento; 
        }
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
        const { categoriasIds, clientesIds, documentoId, ...data } = updateIngresoDto;

        this.ingresoRepository.merge(ingreso, data);

        if (categoriasIds) {
            ingreso.categorias = await this.categoriaRepository.findBy({ id: In(categoriasIds) });
        }

        if (clientesIds) {
            ingreso.clientes = await this.clienteRepository.findBy({ id: In(clientesIds) });
        }

        if (documentoId) {
            const documento = await this.documentoRepository.findOneBy({ id: documentoId });
            if (documento) {
                ingreso.documento = documento;
            }
        }

        return await this.ingresoRepository.save(ingreso);
    }

    async remove(id: number) {
        const ingreso = await this.findOne(id);
        return await this.ingresoRepository.remove(ingreso);
    }
}
