import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('transfer-histories')
export class TransferHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'double' })
  credit: number;

  @ManyToOne(() => User, (x) => x.senders, { onDelete: 'CASCADE' })
  @JoinColumn()
  sender: User;

  @ManyToOne(() => User, (x) => x.receivers, { onDelete: 'CASCADE' })
  @JoinColumn()
  receiver: User;

  @Column()
  sent_at: Date;
}
