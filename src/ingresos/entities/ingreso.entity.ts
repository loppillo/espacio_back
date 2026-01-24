import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CategoriaIngreso } from '../../categoria_ingresos/entities/categoria_ingreso.entity';
import { ClienteIngreso } from '../../clientes_ingresos/entities/cliente_ingreso.entity';
import { DocumentoIngreso } from '../../documentos_ingreso/entities/documento_ingreso.entity';

@Entity('ingresos')
export class Ingreso {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    concepto: string;

    @Column({ type: 'date' })
    fecha: Date;


    @Column({ type: 'int' })
    monto: number;

    @Column({ name: 'metodo_pago', length: 255 })
    metodo_pago: string;

    @ManyToMany(() => CategoriaIngreso, (categoria) => categoria.ingresos)
    @JoinTable({
        name: 'ingresos_categorias',
        joinColumn: { name: 'ingreso_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'categoria_ingreso_id', referencedColumnName: 'id' },
    })
    categorias: CategoriaIngreso[];

    @ManyToMany(() => ClienteIngreso, (cliente) => cliente.ingresos)
    @JoinTable({
        name: 'clientes_ingresos_ingresos',
        joinColumn: { name: 'ingreso_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'cliente_ingreso_id', referencedColumnName: 'id' },
    })
    clientes: ClienteIngreso[];

    @OneToOne(() => DocumentoIngreso)
    @JoinColumn() // <--- ¡AGREGA ESTO!
    documento: DocumentoIngreso;
}
