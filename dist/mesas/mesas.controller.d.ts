import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { MesaService } from './mesas.service';
import { Mesa } from './entities/mesa.entity';
import { Order } from 'src/orders/entities/order.entity';
export declare class MesaController {
    private readonly mesaService;
    constructor(mesaService: MesaService);
    findAll(): Promise<Mesa[]>;
    obtenerMesaPorId(id: number): Promise<Mesa>;
    getDetalleMesa(id: number): Promise<Mesa>;
    findOne(id: number): Promise<Mesa>;
    create(createMesaDto: CreateMesaDto): Promise<Mesa>;
    update(id: number, updateMesaDto: UpdateMesaDto): Promise<Mesa>;
    remove(id: number): Promise<void>;
    actualizarEstadoMesa(id: number, status: string): Promise<Mesa>;
    marcarPedidoPagado(mesaId: number): Promise<Mesa>;
    getMesa(id: number): Promise<Mesa>;
    crearNuevoPedido(id: number): Promise<Order>;
    getPedidosActuales(id: number, numeroVenta: number): Promise<Order[]>;
}
