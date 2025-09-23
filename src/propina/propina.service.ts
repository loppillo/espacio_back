import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePropinaDto } from './dto/create-propina.dto';
import { UpdatePropinaDto } from './dto/update-propina.dto';
import { Propina } from './entities/propina.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class PropinaService {
  constructor(
    
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Propina)
    private readonly propinaRepository: Repository<Propina>

  ) {}

  async create(createPropinaDto: CreatePropinaDto) {
     const orderId = await this.orderRepository.findOneBy({
      id: createPropinaDto.orderId,
    });

    if (!orderId) {
      throw new BadRequestException('la categoria no se encuentra');
    }

    return await this.propinaRepository.save({
      ...createPropinaDto,

      amount: createPropinaDto.amount,
      orderId: orderId
    
    });
  }

  async findAll() {
    return await this.propinaRepository.find();
  }

  async findOne(id: number) {
    return await this.propinaRepository.findOneBy({id});
  }

  async update(id: number, updatePropinaDto: UpdatePropinaDto) {
    return await this.propinaRepository.update(id,updatePropinaDto);
  }

  async remove(id: number) {
    return await this.propinaRepository.delete(id);
  }
}
