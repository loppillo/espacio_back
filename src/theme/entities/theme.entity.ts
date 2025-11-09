import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Theme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '#6C5CE7' })
  primaryColor: string;

  @Column({ default: '#00CEC9' })
  secondaryColor: string;

  @Column({ default: '#ffffff' })
  backgroundColor: string;

  @Column({ default: 'light' })
  mode: string;

  @Column({ default: false })
  isDefault: boolean;
}
