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

  @ManyToOne(() => Branch, (branch) => branch.cartelas, { onDelete: 'CASCADE' })
  @JoinColumn()
  branch: Branch;

  @Column({
    type: 'text',
  })
  board: string;

  @OneToMany(() => GameCartela, (game_cartela) => game_cartela.cartela, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  game_cartelas: GameCartela[];
}
