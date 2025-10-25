import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from './entities/horario.entity';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepo: Repository<Horario>,
  ) {}

  async create(dto: CreateHorarioDto) {
    const horario = this.horarioRepo.create(dto);
    return await this.horarioRepo.save(horario);
  }

  async findAll() {
    return await this.horarioRepo.find();
  }

  async findOne(id: number) {
    const horario = await this.horarioRepo.findOne({ where: { id } });
    if (!horario) throw new NotFoundException('Horario no encontrado');
    return horario;
  }

  async update(id: number, dto: UpdateHorarioDto) {
    const result = await this.horarioRepo.update(id, dto);
    if (result.affected === 0) throw new NotFoundException('Horario no encontrado');
    return this.findOne(id);
  }

  async remove(id: number) {
    const horario = await this.findOne(id);
    return await this.horarioRepo.remove(horario);
  }

  // ⭐ Endpoint especial para frontend
  async getConfig() {
    const horarios = await this.horarioRepo.find();
    return horarios.reduce((acc, h) => {
      acc[h.seccion] = {
        enabled: h.enabled,
        hora_inicio: h.hora_inicio,
        hora_fin: h.hora_fin,
      };
      return acc;
    }, {});
  }
}
