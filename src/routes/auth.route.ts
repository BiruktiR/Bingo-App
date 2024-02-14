import express, { Router } from 'express';
import { validateSchema } from '../middlewares/validation.middleware';
import { LoginSchema } from '../config/zod-schemas/login.schema';
import { generateAccessToken, login } from '../controllers/auth.controller';

export const authRouter: Router = express.Router();

authRouter.post('/login', validateSchema(LoginSchema), login);
authRouter.post('generate-access-token', generateAccessToken);
