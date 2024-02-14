import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from './branch.entity';

@Entity('cartelas')
export class Cartela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Branch, (branch) => branch.company)
  @JoinColumn()
  branch: Branch;

  @Column()
  board: string;
}
