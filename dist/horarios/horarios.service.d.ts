import { Repository } from 'typeorm';
import { Horario } from './entities/horario.entity';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
export declare class HorariosService {
    private readonly horarioRepo;
    constructor(horarioRepo: Repository<Horario>);
    create(dto: CreateHorarioDto): Promise<Horario>;
    findAll(): Promise<Horario[]>;
    findOne(id: number): Promise<Horario>;
    update(id: number, dto: UpdateHorarioDto): Promise<Horario>;
    remove(id: number): Promise<Horario>;
    getConfig(): Promise<{}>;
}
