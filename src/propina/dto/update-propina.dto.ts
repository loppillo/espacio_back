import { PartialType } from '@nestjs/mapped-types';
import { CreatePropinaDto } from './create-propina.dto';

export class UpdatePropinaDto extends PartialType(CreatePropinaDto) {}
