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

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.branch, { cascade: true })
  @JoinColumn()
  users: User[];

  @ManyToOne(() => Company, (company) => company.branches)
  @JoinColumn()
  company: Company;

  @OneToMany(() => Game, (game) => game.branch, { cascade: true })
  @JoinColumn()
  games: Game[];
}
