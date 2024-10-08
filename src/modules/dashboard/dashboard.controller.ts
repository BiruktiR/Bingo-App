import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findById } from '../branch/branch.service';
import { getSales, getTotalSales } from './dashboard.service';
import { ROLES } from '../../config/other-types/Enums';
import { findByUserId } from '../user/user.service';
import { getMomentStartEnd } from '../../config/util-functions/util-functions';

export const getDashboard = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let branchID = req.params.branchID;
    let branch = await findById(branchID);
    let userID = res.locals?.user.id;
    let role = res.locals?.user.role;
    if (branch == null) {
      return res.status(404).json({
        status: false,
        message: 'Branch is not found!',
      });
    }
    if (role !== ROLES.superAdmin) {
      let user = await findByUserId(userID);
      if (user.branch.id !== branch.id) {
        return res.status(401).json({
          status: false,
          message: 'Cannot search data of other branches!',
        });
      }
    }
    let {
      todayStart,
      todayEnd,
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
      yearStart,
      yearEnd,
    } = getMomentStartEnd();

    let todaySales = await getSales(todayStart, todayEnd, branch.id);
    let weeklySales = await getSales(weekStart, weekEnd, branch.id);
    let monthlySales = await getSales(monthStart, monthEnd, branch.id);
    let yearlySales = await getSales(yearStart, yearEnd, branch.id);
    let percentage = await getTotalSales(
      monthStart,
      monthEnd,
      branch.company.id
    );
    res.status(200).json({
      status: true,
      data: {
        todaySales,
        weeklySales,
        monthlySales,
        yearlySales,
        percentage: percentage == 0 ? 0 : monthlySales / percentage,
      },
    });
  }
);
