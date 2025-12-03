import { Injectable } from '@nestjs/common';
import { CreateCostoEnvioDto } from './dto/create-costo_envio.dto';
import { UpdateCostoEnvioDto } from './dto/update-costo_envio.dto';
import { CostoEnvio } from './entities/costo_envio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CostoEnvioService {
  constructor(
    @InjectRepository(CostoEnvio)
    private readonly costoEnvioRepository: Repository<CostoEnvio>,

  ) { }


  async create(createCostoEnvioDto: CreateCostoEnvioDto) {
    const costoEnvio = this.costoEnvioRepository.create(createCostoEnvioDto);
    return await this.costoEnvioRepository.save(costoEnvio);
  }

  async findAll() {
    return await this.costoEnvioRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    return await this.costoEnvioRepository.findOne({ where: { id } });
  }

  async update(id: number, updateCostoEnvioDto: UpdateCostoEnvioDto) {
    await this.costoEnvioRepository.update(id, updateCostoEnvioDto);
    return await this.costoEnvioRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.costoEnvioRepository.delete(id);
    return { message: `Costo de envío con ID ${id} eliminado correctamente` };
  }
}
