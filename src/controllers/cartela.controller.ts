import expressAsyncHandler from 'express-async-handler';
import express, { Request, Response, NextFunction } from 'express';
import {
  findCartela,
  findCartelaById,
  checkAddDuplicate,
  add,
  checkUpdateDuplicate,
  updateCartela,
  deleteById,
} from '../services/cartela.service';
import { findById } from '../services/branch.service';
import { findByUserId } from '../services/user.service';
import { TFindCartelaSchema } from '../config/zod-schemas/cartela.schema';
import {
  convertToBingoArray,
  reverseConvertData,
} from '../config/util-functions';

export const get = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const role: string = res.locals.user.role;
    const filters: TFindCartelaSchema = req.query;
    const user = await findByUserId(res.locals.user?.id);

    let data = await findCartela(role, user?.branch?.id, filters);
    res.status(200).json({
      status: true,
      ...data,
    });
  }
);

export const getById = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let id: number = parseInt(req?.params?.cartelaID);
    const role: string = res.locals.user.role;
    const user = await findByUserId(res.locals.user?.id);
    if (isNaN(id))
      return res.status(404).json({
        status: false,
        message: 'Provided id is not a number!',
      });
    const cartela = await findCartelaById(id, role, user?.branch?.id);
    res.status(200).json({
      status: true,
      data: cartela !== null ? reverseConvertData(cartela.board) : cartela,
    });
  }
);

export const save = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let board = req.body;
    const branch = res.locals.branch;

    if (!(await checkAddDuplicate(board, branch.id)))
      return res.status(302).json({
        status: false,
        message: 'Board already exists!',
      });
    await add(board.board, branch);
    res.status(200).json({
      status: true,
      message: 'Cartela is added successfully!',
    });
  }
);
export const saveMultiple = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let cartela = req.body;
    const branch = res.locals.branch;

    for (let x = 0; x < cartela.board.length; x++) {
      if (!(await checkAddDuplicate(cartela.board[x], branch.id)))
        return res.status(302).json({
          status: false,
          message: 'Board already exists!',
        });
    }
    for (let x = 0; x < cartela.board.length; x++) {
      await add(cartela.board[x], branch);
    }

    res.status(200).json({
      status: true,
      message: 'Cartelas are added successfully!',
    });
  }
);

export const update = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let board = req.body;
    const cartelaID = parseInt(req.params.cartelaID);
    const cartela = res.locals.cartela;
    const role: string = res.locals.user.role;
    const user = await findByUserId(res.locals.user?.id);
    if (!checkUpdateDuplicate(board, cartela?.branch?.id, cartelaID))
      return res.status(302).json({
        status: false,
        message: 'Cartela already exists',
      });
    const updatedCartela = await updateCartela(
      board,
      cartelaID,
      role,
      cartela?.branch?.id
    );
    res.status(200).json({
      status: true,
      message: 'Cartela is updated successfully!',
      data: {
        id: updatedCartela.id,
        branch: updatedCartela.branch,
        board: reverseConvertData(updatedCartela.board),
      },
    });
  }
);
export const deleteCartela = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let id: number = parseInt(req?.params?.cartelaID);
    const role: string = res.locals.user.role;
    const user = await findByUserId(res.locals.user?.id);
    if (isNaN(id))
      return res.status(404).json({
        status: false,
        message: 'Provided id is not a number!',
      });
    const cartela = await findCartelaById(id, role, user?.branch?.id);
    if (cartela === null)
      res.status(404).json({
        status: false,
        message: 'Cartela to be deleted is not found!',
      });
    await deleteById(id);
    res.status(200).json({
      status: true,
      message: 'Cartela is deleted successfully!',
    });
  }
);
