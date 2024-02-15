import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findByCompanyId } from '../services/company.service';
export const updateCompanyPipe = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let companyId = req?.params?.companyID;
    const company = await findByCompanyId(companyId);
    if (company == null)
      return res.status(404).json({
        status: false,
        message: 'Company is not found!',
      });
    if (req?.body?.name === undefined && req?.body?.name == null) {
      req.body.name = company.name;
    }
    next();
  }
);
