import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IngresoService } from './ingresos.service';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';

@Controller('ingresos')
export class IngresoController {
    constructor(private readonly ingresoService: IngresoService) { }

    @Post()
    create(@Body() createIngresoDto: CreateIngresoDto) {
        return this.ingresoService.create(createIngresoDto);
    }

    @Get()
    findAll() {
        return this.ingresoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ingresoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateIngresoDto: UpdateIngresoDto) {
        return this.ingresoService.update(+id, updateIngresoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ingresoService.remove(+id);
    }
}
