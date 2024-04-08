import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Token } from './entities/token.entity';
import { Branch } from './entities/branch.entity';
import { Cartela } from './entities/cartela.entity';
import { Company } from './entities/company.entity';
import { Game } from './entities/game.entity';
import { GameCartela } from './entities/game_cartela.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'bingo_db',
  synchronize: true,
  logging: false,
  entities: [User, Token, Branch, Cartela, Company, Game, GameCartela],
  migrations: [],
  subscribers: [],
  timezone: 'Z',
});
