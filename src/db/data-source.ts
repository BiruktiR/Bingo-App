import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { Branch } from './entities/branch.entity';
import { Cartela } from './entities/cartela.entity';
import { Company } from './entities/company.entity';
import { Game } from './entities/game.entity';
import { GameCartela } from './entities/game_cartela.entity';
import { UserCredit } from './entities/user-credit.entity';
import { Notification } from './entities/notification.entity';
import { TransferHistory } from './entities/transfer-history.entity';
import { config } from 'dotenv';
config();
export const AppDataSource = new DataSource({
  type: 'mysql',
  host:
    process.env.ENVIRONMENT == 'LOCAL'
      ? process.env.DB_HOST
      : process.env.DOCKER_DB_HOST,
  port: 3306,
  username:
    process.env.ENVIRONMENT == 'LOCAL'
      ? process.env.DB_USERNAME
      : process.env.DOCKER_DB_USERNAME,
  password:
    process.env.ENVIRONMENT == 'LOCAL'
      ? process.env.DB_PASSWORD
      : process.env.DOCKER_DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Token,
    Branch,
    Cartela,
    Company,
    Game,
    GameCartela,
    UserCredit,
    Notification,
    TransferHistory,
  ],
  migrations: [],
  subscribers: [],
  timezone: 'Z',
});
