import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import { TBingo } from '../config/other-types/match';
export const AddGamePipe = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    if (req?.body?.pattern !== undefined && req?.body?.pattern !== null) {
      req.body.pattern = JSON.parse(req.body.pattern);
      if (req.body.pattern?.length > 2) {
        if (req.body.pattern[2]?.N) {
          req.body.pattern[2].N = 0;
        }
      }
      let pattern: TBingo[] = req.body.pattern;
      if (Array.isArray(req.body.pattern)) {
        req.body.pattern = pattern.map((obj) => Object.values(obj));
      }
    }

    if (req?.body?.type !== undefined && req?.body?.type !== null)
      req.body.type = parseInt(req.body.type);
    if (req?.body?.bet !== undefined && req?.body?.bet !== null)
      req.body.bet = Number(req.body.bet);

    if (req?.body?.cartelas !== undefined && req?.body?.cartelas !== null)
      req.body.cartelas = JSON.parse(req.body.cartelas);
    next();
  }
);
export const FindGamePipe = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    if (
      req?.body?.date !== undefined &&
      req?.body?.date !== null &&
      !isNaN(Date.parse(req?.body?.date))
    ) {
      const date = new Date(req.body.date);

      const convertedDate = moment(date).tz('Europe/Moscow');

      req.body.date = convertedDate.format('YYYY-MM-DD');
    }
    if (req?.query?.cartelaID !== undefined && req?.query?.cartelaID !== null)
      req.body.cartelaID = parseInt(req.body.cartelaID);
    if (req?.body?.cartelas !== undefined && req?.body?.cartelas !== null)
      req.body.cartelas = JSON.parse(req.body.cartelas);

    next();
  }
);
export const CheckGamePipe = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    if (req?.body?.steps !== undefined && req?.body?.steps !== null)
      req.body.steps = Number(req.body.steps);
    next();
  }
);
