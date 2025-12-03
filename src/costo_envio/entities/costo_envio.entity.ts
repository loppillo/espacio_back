import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('costo_envio')
export class CostoEnvio {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    precio_envio: number;

}
