import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'johnhacker',
  password: 'password',
  database: 'bingo_db',
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});
