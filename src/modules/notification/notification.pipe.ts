import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getMomentDate } from '../../config/util-functions/util-functions';
import { DATE_TYPE } from '../../config/other-types/Enums';
import moment from 'moment';

export const FindNotificationPipe = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (
      req?.query?.start_date !== undefined &&
      req?.query?.start_date !== null
    ) {
      let dateString: string = req?.query?.start_date.toString();
      const parsedDate = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
      if (parsedDate.isValid()) {
        res.locals.start_date = getMomentDate(dateString, DATE_TYPE.start);

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
  }
);
