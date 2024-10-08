import express, { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';

export const validateToken = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    if (!req?.headers?.authorization)
      return res.status(400).json({
        status: false,
        message: 'Token is not found!',
      });
    const token = req.headers.authorization.split(' ')[1];
    verify(token, process.env.ACCESS_KEY, (err, user) => {
      if (err)
        return res.status(404).json({
          status: 404,
          message: err.message,
        });
      res.locals.user = user;
      next();
    });
  }
);
