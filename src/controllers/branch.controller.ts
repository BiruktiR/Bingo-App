import expressAsyncHandler from 'express-async-handler';
import express, { Request, Response, NextFunction } from 'express';
import {
  find,
  findById,
  findByName,
  save,
  checkDupUpdate,
  modify,
} from '../services/branch.service';
import { TBranch } from '../config/zod-schemas/branch.schema';
import { findByCompanyId } from '../services/company.service';

export const get = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = await find();
    res.status(200).json({
      status: true,
      data,
    });
  }
);

export const getById = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    const branchID = req?.params?.branchID;
    const companyID = req?.params?.companyID;
    let data = await findById(branchID, companyID);
    if (data == null)
      return res.status(400).json({
        status: false,
        message: 'Branch is not found!',
      });
    res.status(200).json({
      status: true,
      data,
    });
  }
);

export const add = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    const branch: TBranch = {
      name: req.body?.name,
    };
    const companyID = req.params?.companyID;
    let company = await findByCompanyId(req.params?.companyID);
    if (company == null)
      return res.status(404).json({
        status: false,
        message: 'Company is not found!',
      });
    console.log(branch);
    const data = await findByName(branch.name, companyID);
    console.log(data);
    if (data !== null)
      return res.status(402).json({
        status: false,
        message: 'Branch already exists!',
      });
    await save(branch, company);
    res.status(200).json({
      status: true,
      message: 'Branch is added successfully!',
    });
  }
);

export const update = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    const branchID = req?.params?.branchID;
    const companyID = req?.params?.companyID;

    const data = await findById(branchID, companyID);
    if (data == null)
      return res.status(404).json({
        status: false,
        message: 'Branch is not found!',
      });
    data.name = req.body.name;
    let checkUpdateStatus = await checkDupUpdate(data, companyID);
    if (checkUpdateStatus != null)
      return res.status(402).json({
        status: false,
        message: 'Branch already exists!',
      });
    let branchData = await modify(data, companyID);
    res.status(200).json({
      status: true,
      message: 'Branch is updated successfully!',
      data: branchData,
    });
  }
);
