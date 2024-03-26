import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import moment from 'moment-timezone';
import { TBingo } from '../config/other-types/match';
import { convertBool, getMomentDate } from '../config/util-functions';
import { DATE_TYPE } from '../config/other-types/Enums';
export const AddGamePipe = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    if (req?.body?.pattern !== undefined && req?.body?.pattern !== null) {
      req.body.pattern = JSON.parse(req.body.pattern);

      // if (req.body.pattern?.length > 2) {
      //   if (req.body.pattern[2]?.N) {
      //     req.body.pattern[2].N = false;
      //   }
      // }
      if (req.body.pattern?.N.length > 2) {
        req.body.pattern.N[2] = false;
      }
      // let pattern: TBingo[] = req.body.pattern;
      // if (Array.isArray(req.body.pattern)) {
      //   req.body.pattern = pattern.map((obj) => Object.values(obj));
      // }
      req.body.pattern = convertBool(req.body.pattern);
      console.log(req.body.pattern);
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
      req?.query?.start_date !== undefined &&
      req?.query?.start_date !== null
    ) {
      console.log(req.query.start_date);
      let dateString: string = req?.query?.start_date.toString();
      const parsedDate = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
      if (parsedDate.isValid()) {
        res.locals.start_date = getMomentDate(dateString, DATE_TYPE.start);
        console.log('important', res.locals.start_date);
        req.query.start_date = parsedDate.toDate().toString();
      }
    }
    if (req?.query?.end_date !== undefined && req?.query?.end_date !== null) {
      let dateString: string = req?.query?.end_date.toString();
      const parsedDate = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
      if (parsedDate.isValid()) {
        res.locals.end_date = getMomentDate(dateString, DATE_TYPE.end);
        req.query.end_date = parsedDate.toDate().toString();
      }
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
