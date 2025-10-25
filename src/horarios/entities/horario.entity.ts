import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Horario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  seccion: string;  // "local" | "delivery"

  @Column()
  hora_inicio: string; // formato "HH:mm"

  @Column()
  hora_fin: string; // formato "HH:mm"

  @Column({ default: true })
  enabled: boolean;
}
