import {
  Column,
  Entity,
  IsNull,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Token } from './token.entity';
import { Branch } from './branch.entity';
import { Game } from './game.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column({
    unique: true,
  })
  username: string;

  @Column()
  phone_number: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column({ default: false })
  is_verified: Boolean;

  @Column({ default: true })
  status: Boolean;

  @OneToOne(() => Token, (x) => x.token, { onDelete: 'CASCADE' })
  @JoinColumn()
  token: Token;

  @ManyToOne(() => Branch, (branch) => branch.users, { onDelete: 'CASCADE' })
  @JoinColumn()
  branch: Branch;

  @OneToMany(() => Game, (game) => game.player, { onDelete: 'CASCADE' })
  @JoinColumn()
  games: Game[];
}
