import express, { Application } from 'express';
import { config } from 'dotenv';
import { AppDataSource } from './db/data-source';
import cors from 'cors';
config();
const app: Application = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log('Database is started successfully!');
  })
  .catch((err: Error) => {
    console.error(err);
  });

app.listen(process.env.PORT_NUMBER, () => {
  console.log('Server has started successfully!');
});
