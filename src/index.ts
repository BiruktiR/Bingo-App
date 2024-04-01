import express, { Application } from 'express';
import { config } from 'dotenv';
import { AppDataSource } from './db/data-source';
import cors from 'cors';
import { authRouter } from './routes/auth.route';
import { branchRouter } from './routes/branch.route';
import { globalValidation } from './middlewares/global-exception.middleware';
import { initializeSuperAdmin } from './services/user.service';
import { companyRouter } from './routes/company.route';
import { userRouter } from './routes/user.route';
import { cartelaRouter } from './routes/cartela.route';
import { gameRouter } from './routes/game.route';
import { dashboardRouter } from './routes/dashboard.route';

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
  .then(async () => {
    console.log('Database is started successfully!');
    await initializeSuperAdmin();
  })
  .catch((err: Error) => {
    console.error(err);
  });
app.use('/api/auth', authRouter);
app.use('/api/branch', branchRouter);
app.use('/api/company', companyRouter);
app.use('/api/user', userRouter);
app.use('/api/cartela', cartelaRouter);
app.use('/api/game', gameRouter);
app.use('/api/dashboard', dashboardRouter);

app.use(globalValidation);
app.listen(process.env.PORT_NUMBER, () => {
  console.log('Server has started successfully!');
});
