import {
  Column,
  Entity,
  IsNull,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_credits')
export class UserCredit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'double' })
  credit: number;

  @Column()
  percentage_cut: number;

  @Column({ type: 'double' })
  current_credit: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
