import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PropinaService } from './propina.service';
import { CreatePropinaDto } from './dto/create-propina.dto';
import { UpdatePropinaDto } from './dto/update-propina.dto';

@Controller('propina')
export class PropinaController {
  constructor(private readonly propinaService: PropinaService) {}

  @Post()
  create(@Body() createPropinaDto: CreatePropinaDto) {
    return this.propinaService.create(createPropinaDto);
  }

  @Get()
  findAll() {
    return this.propinaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propinaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropinaDto: UpdatePropinaDto) {
    return this.propinaService.update(+id, updatePropinaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propinaService.remove(+id);
  }
}
