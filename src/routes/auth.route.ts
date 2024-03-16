import express, { Router } from 'express';
import { validateSchema } from '../middlewares/validation.middleware';
import { LoginSchema } from '../config/zod-schemas/login.schema';
import { generateAccessToken, login } from '../controllers/auth.controller';
import { generateUniqueRandomNumbers } from '../services/game.service';
import { encryptPassword } from '../services/auth.service';
import { validationType } from '../config/other-types/Enums';

export const authRouter: Router = express.Router();

authRouter.post(
  '/login',
  validateSchema(LoginSchema, validationType.body),
  login
);
authRouter.post('/generate-access-token', generateAccessToken);
authRouter.use('/test', async (req: any, res: any, next: any) => {
  // let randomArray: number[] = [];
  // const totalNumbers = 75;
  // const minRange = 1;
  // const maxRange = 75;
  // const uniqueRandomNumbers = generateUniqueRandomNumbers(
  //   totalNumbers,
  //   minRange,
  //   maxRange
  // );
  // res.status(200).json({
  //   status: true,
  //   data: uniqueRandomNumbers,
  // });
  let password: string = '12345678';
  const encryptedPassword: string = await encryptPassword(password);
  res.status(200).json({
    pass: encryptedPassword,
  });
});
