import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Theme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '#ff7f00' })
  primaryColor: string;

  @Column({ default: '#ffc107' })
  secondaryColor: string;

  @Column({ default: '#ffffff' })
  backgroundColor: string;

  @Column({ type: 'longtext', nullable: true })
 backgroundImage: string;

  @Column({ nullable: true })
  gradient: string;

  @Column({ default: 'light' })
  mode: string; // 'light' | 'dark' | 'glass'

  @Column({ default: 'rounded' })
  borderStyle: string; // 'rounded' | 'square'

  @Column({ default: 'normal' })
  cardShadow: string; // 'none' | 'normal' | 'deep'

  @Column({ default: 'full' })
  layoutType: string; // 'full' | 'boxed' | 'minimal' | 'glass'

  @Column({ default: false })
  isDefault: boolean;
}
