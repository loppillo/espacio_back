import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ingreso } from 'src/ingresos/entities/ingreso.entity';

@Entity('documentos_ingreso')
export class DocumentoIngreso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'tipo_documento', length: 255 })
    tipo_documento: string;

    @Column({ name: 'num_documento', type: 'int' })
    num_documento: number;

    @Column({ name: 'ingreso_id', type: 'int', nullable: true })
    ingresoId: number;

    @ManyToOne(() => Ingreso, (ingreso) => ingreso.documentos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ingreso_id' })
    ingreso: Ingreso;
}
