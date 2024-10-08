import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findNotification } from './notification.service';

export const getNotification = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let userID = res.locals.user.id;
    let filters = req.query;
    if (filters?.start_date && res?.locals?.start_date) {
      filters.start_date = res.locals.start_date;
    }
    if (filters?.end_date && res?.locals?.end_date) {
      filters.end_date = res.locals.end_date;
    }
    let data = await findNotification(filters, userID);
    res.status(200).json({
      status: true,
      ...data,
    });
  }
);
