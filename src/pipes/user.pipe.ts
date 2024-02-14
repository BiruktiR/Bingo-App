import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findByUserId } from '../services/user.service';
export const addUserPipe = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      req?.body?.status !== undefined &&
      req?.body?.status !== null &&
      req?.body?.status !== 'null' &&
      typeof req?.body?.status === 'boolean'
    ) {
      req.body.status = req.body.status === 'true' ? true : false;
    }
    next();
  }
);
export const updateUserPipe = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let userId = req.params.userID;
    let user = await findByUserId(userId);
    if (user == null)
      res.status(404).json({
        status: false,
        message: 'User is not found!',
      });
    if (
      req?.body?.full_name === undefined ||
      req?.body?.full_name === null ||
      req?.body?.full_name === 'null'
    )
      req.body.full_name = user.full_name;
    if (
      req?.body?.username === undefined ||
      req?.body?.username === null ||
      req?.body?.username === 'null'
    )
      req.body.username = user.username;
    if (
      req?.body?.password === undefined ||
      req?.body?.password === null ||
      req?.body?.password === 'null'
    )
      req.body.password = 'not password';
    if (
      req?.body?.phone_number === undefined ||
      req?.body?.phone_number === null ||
      req?.body?.phone_number === 'null'
    )
      req.body.phone_number = user.phone_number;
    if (
      req?.body?.role === undefined ||
      req?.body?.role === null ||
      req?.body?.role === 'null'
    ) {
      req.body.role = user.role;
    }
    if (
      req?.body?.status === undefined ||
      req?.body?.status === null ||
      req?.body?.status === 'null'
    ) {
      req.body.status = user.status;
    } else {
      req.body.status = req.body.status === 'true' ? true : false;
    }
    next();
  }
);
