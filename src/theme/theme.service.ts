import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { Theme } from './entities/theme.entity';

@Injectable()
export class ThemeService {
  constructor(
    @InjectRepository(Theme)
    private repo: Repository<Theme>,
  ) {}

  async create(dto: CreateThemeDto): Promise<Theme> {
    const preset = this.repo.create(dto);
    return this.repo.save(preset);
  }

  async findAll(): Promise<Theme[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Theme> {
    const preset = await this.repo.findOne({ where: { id } });
    if (!preset) throw new NotFoundException('Preset no existe.');
    return preset;
  }

  async update(id: number, dto: UpdateThemeDto): Promise<Theme> {
    const preset = await this.findOne(id);

    // Si está marcando uno como default → desmarcar todos los otros
    if (dto.isDefault) {
      await this.repo.update({ isDefault: true }, { isDefault: false });
    }

    Object.assign(preset, dto);
    return this.repo.save(preset);
  }

  async remove(id: number) {
    const preset = await this.findOne(id);
    return this.repo.remove(preset);
  }

  async getDefaultPreset(): Promise<Theme> {
    let preset = await this.repo.findOne({ where: { isDefault: true } });

    // Si no existe ninguno marcado como default → crea uno
    if (!preset) {
      preset = this.repo.create({
        name: 'Default',
        isDefault: true,
      });
      await this.repo.save(preset);
    }

    return preset;
  }
}
