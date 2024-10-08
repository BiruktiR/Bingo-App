import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findAllUsersById, findByUserId } from '../user/user.service';
import {
  NOTIFICATION_TYPE,
  ROLES,
  TRANSFER_TYPE,
} from '../../config/other-types/Enums';
import { TAddUserCreditSchema } from './user-credit.schema';
import {
  FindUserCredit,
  addNotification,
  findTransfer,
  findUserCreditById,
  generateNotificationMessage,
  transferUserCredit,
  updateCredit,
  updateUserCredit,
} from './user-credit.service';
import { getUTCDate } from '../../config/util-functions/util-functions';
import { TAddCredit } from 'src/config/other-types/metadata';

export const get = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let filters = req.query;
    let data = await FindUserCredit(filters);
    res.status(200).json({
      status: true,
      ...data,
    });
  }
);

export const getById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let userCreditID = req.params?.userCreditID;
    let data = await findUserCreditById(userCreditID);
    res.status(200).json({
      status: true,
      ...data,
    });
  }
);

export const addGameCredit = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let data: TAddUserCreditSchema = req.body;
    let userID = req.params?.userID;
    const user = await findByUserId(userID);
    if (user == null)
      return res.status(404).json({
        status: false,
        message: 'User is not found!',
      });
    if (user.role !== ROLES.admin)
      return res.status(401).json({
        status: false,
        message: 'Credited user is not admin!',
      });
    await updateUserCredit(data, user.user_credit);
    res.status(200).json({
      status: true,
      message: 'User credit is updated!',
    });
  }
);
export const findTransferHistory = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('gg');
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);
    let filters = req.query;

    if (filters?.start_date && res?.locals?.start_date) {
      filters.start_date = res.locals.start_date;
    }
    if (filters?.end_date && res?.locals?.end_date) {
      filters.end_date = res.locals.end_date;
    }
    let data = await findTransfer(filters, role, user);
    console.log(data);
    res.status(200).json({
      status: true,
      ...data,
    });
  }
);
export const transferCredit = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let transfer_credit = req.body.credit;
    let sentToID = req.params?.userID;
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);
    let sent_to_user = await findByUserId(req.params?.userID);
    if (sent_to_user === null)
      return res.status(404).json({
        status: false,
        message: 'User to be transferred to is not found!',
      });
    if (
      sent_to_user.branch.id !== user.branch.id &&
      user.role === ROLES.cashier
    )
      return res.status(401).json({
        status: false,
        message:
          'Current role does not allow transferring of credits to other branches',
      });
    if (user.user_credit.current_credit < transfer_credit)
      return res.status(302).json({
        status: false,
        message: 'Current credit is lower than the transferable credit!',
      });
    const transferHistory = await transferUserCredit(
      transfer_credit,
      user,
      sent_to_user
    );
    const currentCreditData: TAddCredit = {
      id: user.user_credit.id,
      credit: user.user_credit.credit,
      currentCredit: user.user_credit.current_credit - transfer_credit,
      percentageCut: user.user_credit.percentage_cut,
    };
    const receivedCreditData: TAddCredit = {
      id: sent_to_user.user_credit.id,
      credit: sent_to_user.user_credit.credit,
      currentCredit: sent_to_user.user_credit.current_credit + transfer_credit,
      percentageCut: sent_to_user.user_credit.percentage_cut,
    };

    // let currentCreditData = {
    //   credit: 0,
    //   percentage_cut: user.user_credit.percentage_cut,
    //   current_credit: transfer_credit * -1,
    // };

    await updateCredit(currentCreditData);
    await updateCredit(receivedCreditData);
    if (user.user_credit.credit < 200)
      await addNotification(
        getUTCDate(),
        'Current credit is lower than 200',
        user,
        NOTIFICATION_TYPE.alert
      );
    await addNotification(
      transferHistory.sent_at,
      generateNotificationMessage(
        TRANSFER_TYPE.sender,
        user.full_name,
        sent_to_user.full_name,
        transfer_credit
      ),
      user,
      NOTIFICATION_TYPE.bankTransfer
    );
    await addNotification(
      transferHistory.sent_at,
      generateNotificationMessage(
        TRANSFER_TYPE.receiver,
        user.full_name,
        sent_to_user.full_name,
        transfer_credit
      ),
      sent_to_user,
      NOTIFICATION_TYPE.bankTransfer
    );
    res.status(200).json({
      status: true,
      message: 'Credit is transferred successfully!',
    });
  }
);
