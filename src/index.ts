import cors from 'cors';
import { config } from 'dotenv';
import express, { Application } from 'express';
import { globalValidation } from './config/global-utils/middlewares/global-exception.middleware';
import { AppDataSource } from './db/data-source';
import { authRouter } from './modules/auth/auth.route';
import { branchRouter } from './modules/branch/branch.route';
import { cartelaRouter } from './modules/cartela/cartela.route';
import { companyRouter } from './modules/company/company.route';
import { dashboardRouter } from './modules/dashboard/dashboard.route';
import { gameRouter } from './modules/game/game.route';
import { notificationRouter } from './modules/notification/notification.route';
import { transcriptionRouter } from './modules/transcription/transcription.route';
import { userCreditRouter } from './modules/user-credit/user-credit.route';
import { genUserCredit } from './modules/user-credit/user-credit.service';
import { userRouter } from './modules/user/user.route';
import { initializeSuperAdmin } from './modules/user/user.service';
const { xss } = require('express-xss-sanitizer');
config();
const app: Application = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(xss());

AppDataSource.initialize()
  .then(async () => {
    console.log('Database is started successfully!');
    await initializeSuperAdmin();
    await genUserCredit();
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
app.use('/api/transcription', transcriptionRouter);
app.use('/api/user-credit', userCreditRouter);
app.use('/api/notification', notificationRouter);

app.use(globalValidation);
app.listen(process.env.PORT_NUMBER, () => {
  console.log('Server has started successfully!');
});
