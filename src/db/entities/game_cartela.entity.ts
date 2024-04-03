import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { Game } from './game.entity';
import { Cartela } from './cartela.entity';

@Entity('game_cartelas')
export class GameCartela {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cartela, (cartela) => cartela.game_cartelas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cartela: Cartela;

  @ManyToOne(() => Game, (game) => game.game_cartelas, { onDelete: 'CASCADE' })
  @JoinColumn()
  game: Game;

  @Column()
  attempts: number;

  @Column({
    type: 'text',
  })
  matched_board: string;
  @Column()
  is_fully_matched: boolean;
}
