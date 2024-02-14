import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findById } from '../services/branch.service';
export const updateBranchPipe = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let branchId = req?.params?.branchID;
    let companyId = req?.params?.companyID;
    const branch = await findById(branchId, companyId);
    if (branch == null)
      res.status(404).json({
        status: false,
        message: 'Branch is not found!',
      });
    if (req?.body?.name !== undefined && req?.body?.name != null) {
      req.body.name = branch.name;
    }
    next();
  }
);
