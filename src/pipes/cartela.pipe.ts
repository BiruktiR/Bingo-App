import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findById } from '../services/branch.service';
import { findCartelaById } from '../services/cartela.service';
import { findByUserId } from '../services/user.service';
export const addCartelaPipe = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let branchId = req?.params?.branchID;
    const branch = await findById(branchId);
    if (branch == null)
      return res.status(404).json({
        status: false,
        message: 'Branch is not found!',
      });
    res.locals.branch = branch;
    if (req?.body?.board !== undefined && req?.body?.board !== null) {
      req.body.board = JSON.parse(req.body.board);
    }
    next();
  }
);
export const updateCartelaPipe = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let cartelaId = parseInt(req?.params?.cartelaID);
    const role: string = res.locals.user.role;
    const user = await findByUserId(res.locals.user?.id);
    if (isNaN(cartelaId))
      return res.status(404).json({
        status: false,
        message: 'Provided id is not a number!',
      });
    const cartela = await findCartelaById(cartelaId, role, user?.branch?.id);
    if (cartela == null)
      return res.status(404).json({
        status: false,
        message: 'Cartela is not found!',
      });
    res.locals.cartela = cartela;
    if (req?.body?.board === undefined && req?.body?.cartela == null) {
      req.body.board = cartela.board;
    } else {
      req.body.board = JSON.parse(req.body.board);
    }
    next();
  }
);
