import express, { Router } from 'express';
import { validateSchema } from '../../config/global-utils/middlewares/validation.middleware';
import { LoginSchema } from './login.schema';
import { generateAccessToken, login, updatePassword } from './auth.controller';
import { generateUniqueRandomNumbers } from '../game/game.service';
import { encryptPassword } from './auth.service';
import {
  GUARD_TYPES,
  ROLES,
  validationType,
} from '../../config/other-types/Enums';
import { validateToken } from '../../config/global-utils/middlewares/validate-token.middleware';
import { validateRole } from '../../config/global-utils/guards/role.guard';
import { UpdatePasswordSchema } from '../user/user.schema';

export const authRouter: Router = express.Router();

authRouter.post(
  '/login',
  validateSchema(LoginSchema, validationType.body),
  login
);
authRouter.post('/generate-access-token', generateAccessToken);
// authRouter.use('/test', async (req: any, res: any, next: any) => {
//   // let randomArray: number[] = [];
//   // const totalNumbers = 75;
//   // const minRange = 1;
//   // const maxRange = 75;
//   // const uniqueRandomNumbers = generateUniqueRandomNumbers(
//   //   totalNumbers,
//   //   minRange,
//   //   maxRange
//   // );
//   // res.status(200).json({
//   //   status: true,
//   //   data: uniqueRandomNumbers,
//   // });
//   let password: string = '12345678';
//   const encryptedPassword: string = await encryptPassword(password);
//   res.status(200).json({
//     pass: encryptedPassword,
//   });
// });
authRouter.put(
  '/password',
  validateToken,
  validateRole(GUARD_TYPES.all),
  validateSchema(UpdatePasswordSchema, validationType.body),
  updatePassword
);
