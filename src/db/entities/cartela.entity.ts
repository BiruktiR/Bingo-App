import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { GameCartela } from './game_cartela.entity';

@Entity('cartelas')
export class Cartela {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Branch, (branch) => branch.company)
  @JoinColumn()
  branch: Branch;

  @Column()
  board: string;

  @OneToMany(() => GameCartela, (game_cartela) => game_cartela.cartela, {
    cascade: true,
  })
  @JoinColumn()
  game_cartelas: GameCartela[];
}
