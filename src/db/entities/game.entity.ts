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

  @Column({
    type: 'text',
  })
  pattern: string;

  @Column({ type: 'double' })
  bet: number;

  @ManyToOne(() => Branch, (branch) => branch.games, { onDelete: 'CASCADE' })
  @JoinColumn()
  branch: Branch;

  @Column()
  date: Date;

  @Column()
  type: number;

  @OneToMany(() => GameCartela, (game_cartela) => game_cartela.game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  game_cartelas: GameCartela[];

  @ManyToOne(() => User, (user) => user.games, { onDelete: 'CASCADE' })
  @JoinColumn()
  player: User;
}
