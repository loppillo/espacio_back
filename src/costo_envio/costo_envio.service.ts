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
      
    ) {}


  async create(createCostoEnvioDto: CreateCostoEnvioDto) {
    return await this.costoEnvioRepository.create(createCostoEnvioDto);
  }

  findAll() {
    return `This action returns all costoEnvio`;
  }

  findOne(id: number) {
    return `This action returns a #${id} costoEnvio`;
  }

  update(id: number, updateCostoEnvioDto: UpdateCostoEnvioDto) {
    return `This action updates a #${id} costoEnvio`;
  }

  remove(id: number) {
    return `This action removes a #${id} costoEnvio`;
  }
}
