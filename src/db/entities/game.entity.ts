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
import { User } from './user.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  called_numbers: string;

  @Column()
  pattern: string;

  @Column({ type: 'double' })
  bet: number;

  @ManyToOne(() => Branch, (branch) => branch.games)
  @JoinColumn()
  branch: Branch;

  @Column({ type: 'date' })
  date: string;

  @Column()
  type: number;

  @OneToMany(() => GameCartela, (game_cartela) => game_cartela.game, {
    cascade: true,
  })
  @JoinColumn()
  game_cartelas: GameCartela[];

  @ManyToOne(() => User, (user) => user.games)
  @JoinColumn()
  player: User;
}
