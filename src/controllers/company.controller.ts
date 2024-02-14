import expressAsyncHandler from 'express-async-handler';
import express, { Request, Response, NextFunction } from 'express';
import {
  find,
  findByCompanyId,
  findByName,
  save,
  checkDupUpdate,
  modify,
} from '../services/company.service';
import { TCompany } from '../config/zod-schemas/company.schema';

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
  async (req: Request, res: Response, next: NextFunction) => {
    let data = await findByCompanyId(req?.params?.companyID);
    if (data == null)
      res.status(400).json({
        status: false,
        message: 'Company is not found!',
      });
    res.status(200).json({
      status: true,
      data,
    });
  }
);

export const add = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const company: TCompany = {
      name: req.body?.name,
    };
    const data = await findByName(company.name);
    if (data !== null)
      res.status(402).json({
        status: false,
        message: 'Company already exists!',
      });
    await save(company);
    res.status(200).json({
      status: true,
      message: 'Company is added successfully!',
    });
  }
);

export const update = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await findByCompanyId(req?.params?.companyID);
    if (data == null)
      res.status(404).json({
        status: false,
        message: 'Company is not found!',
      });
    data.name = req.body.name;
    let checkUpdateStatus = await checkDupUpdate(data);
    if (checkUpdateStatus != null)
      res.status(402).json({
        status: false,
        message: 'Company already exists!',
      });
    let companyData = await modify(data);
    res.status(200).json({
      status: true,
      message: 'Company is updated successfully!',
      data: companyData,
    });
  }
);
