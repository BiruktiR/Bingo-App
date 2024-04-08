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

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.branch, { onDelete: 'CASCADE' })
  @JoinColumn()
  users: User[];

  @ManyToOne(() => Company, (company) => company.branches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  company: Company;

  @OneToMany(() => Game, (game) => game.branch, { onDelete: 'CASCADE' })
  @JoinColumn()
  games: Game[];

  @OneToMany(() => Cartela, (cartela) => cartela.branch, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  cartelas: Cartela[];
}
