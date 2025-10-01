import { Repository } from 'typeorm';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { Mesa } from './entities/mesa.entity';
import { Order } from 'src/orders/entities/order.entity';
export declare class MesaService {
    private readonly mesaRepository;
    private readonly ordersRepository;
    constructor(mesaRepository: Repository<Mesa>, ordersRepository: Repository<Order>);
    findAll(): Promise<Mesa[]>;
    findOne(id: number): Promise<Mesa>;
    create(createMesaDto: CreateMesaDto): Promise<Mesa>;
    update(id: number, updateMesaDto: UpdateMesaDto): Promise<Mesa>;
    remove(id: number): Promise<void>;
    obtenerMesaPorId(id: number): Promise<Mesa>;
    actualizarEstadoMesa(id: number, status: string): Promise<Mesa>;
    obtenerDetalleMesa(id: number): Promise<Mesa>;
    marcarPedidoPagado(mesaId: number): Promise<Mesa>;
    getMesa(mesaId: number): Promise<Mesa>;
    crearNuevoPedido(mesaId: number): Promise<Order>;
    getPedidosActuales(mesaId: number, numeroVenta: number): Promise<Order[]>;
    getProductosPorMesa(mesaId: number): Promise<any[]>;
    eliminarProducto(orderId: number, productId: number): Promise<{
        message: string;
    }>;
}
