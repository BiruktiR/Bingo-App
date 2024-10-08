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
import { UserCredit } from './user-credit.entity';
import { TransferHistory } from './transfer-history.entity';
import { Notification } from './notification.entity';

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

  @OneToOne(() => Token, { onDelete: 'CASCADE' })
  @JoinColumn()
  token: Token;

  @ManyToOne(() => Branch, (branch) => branch.users, { onDelete: 'CASCADE' })
  @JoinColumn()
  branch: Branch;

  @OneToMany(() => Game, (game) => game.player, { onDelete: 'CASCADE' })
  @JoinColumn()
  games: Game[];

  @OneToOne(() => UserCredit, (credit) => credit.user, { onDelete: 'CASCADE' })
  @JoinColumn()
  user_credit: UserCredit;

  @OneToMany(() => TransferHistory, (x) => x.sender, { onDelete: 'CASCADE' })
  @JoinColumn()
  senders: TransferHistory[];
  @OneToMany(() => TransferHistory, (x) => x.receiver, { onDelete: 'CASCADE' })
  @JoinColumn()
  receivers: TransferHistory[];

  @OneToMany(() => Notification, (x) => x.user, { onDelete: 'CASCADE' })
  @JoinColumn()
  notifications: Notification[];
}
