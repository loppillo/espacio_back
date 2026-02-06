import { IsEnum, IsNotEmpty } from 'class-validator';

export enum EstadoOrden {
  PAGADO = 'Pagado',
  PENDIENTE = 'Pendiente',
}

export class UpdateEstadoDto {
  @IsNotEmpty()
  @IsEnum(EstadoOrden, {
    message: 'El estado debe ser "Pagado" o "Pendiente"',
  })
  estado: EstadoOrden;
}
