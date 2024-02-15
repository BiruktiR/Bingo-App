import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { TOKEN_TYPE } from '../config/other-types/Enums';
import {
  generateToken,
  updateToken,
  verifyToken,
} from '../services/token.service';
import { verify } from 'jsonwebtoken';
import { TLogin } from '../config/zod-schemas/login.schema';
import {
  findByUsername,
  findByUsernameForLogin,
} from '../services/user.service';
import { isPasswordCorrect } from '../services/auth.service';

export const login = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let loginData: TLogin = req.body;
    let user = await findByUsernameForLogin(loginData.username);
    if (user == null)
      return res.status(400).json({
        status: 400,
        message: 'Username or password is incorrect',
      });
    if (!isPasswordCorrect(loginData.password, user.password))
      return res.status(400).json({
        status: 400,
        message: 'Username or password is incorrect',
      });
    const accessToken = await generateToken(TOKEN_TYPE.access, {
      id: user.id,
      role: user.role,
    });
    let refreshToken = user.token.token;

    if (!verifyToken(TOKEN_TYPE.refresh, refreshToken)) {
      refreshToken = await generateToken(TOKEN_TYPE.refresh, {
        id: user.id,
        role: user.role,
      });
      await updateToken(user.token.id, refreshToken);
    }
    res.status(200).json({
      status: true,
      message: 'Login is successful!',
      data: {
        id: user.id,
        username: user.username,
        phone_number: user.phone_number,
        role: user.role,
        is_verified: user.is_verified,
        status: user.status,
        branch: user.branch,
      },
      access_token: accessToken,
      refreshToken: refreshToken,
    });
  }
);

export const generateAccessToken = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let refreshToken: string = req.body.token;
    if (!verifyToken(TOKEN_TYPE.refresh, refreshToken))
      return res.status(401).json({
        status: false,
        message: 'Refresh token is invalid',
      });
    verify(refreshToken, process.env.REFRESH_KEY, (err, user: any) => {
      if (err)
        return res.status(404).json({
          status: 404,
          message: err.message,
        });
      const accessToken = generateToken(TOKEN_TYPE.access, {
        id: user.id,
        role: user.role,
      });
      return res.status(200).json({
        status: true,
        token: accessToken,
      });
    });
  }
);
