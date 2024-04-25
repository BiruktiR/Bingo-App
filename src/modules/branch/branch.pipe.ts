import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findById } from './branch.service';
export const updateBranchPipe = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let branchId = req?.params?.branchID;
    const branch = await findById(branchId);
    if (branch == null)
      return res.status(404).json({
        status: false,
        message: 'Branch is not found!',
      });
    if (req?.body?.name === undefined && req?.body?.name == null) {
      req.body.name = branch.name;
    }
    next();
  }
);
