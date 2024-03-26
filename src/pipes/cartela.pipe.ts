import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findById } from '../services/branch.service';
import { findCartelaById } from '../services/cartela.service';
import { findByUserId } from '../services/user.service';
import { number } from 'zod';
import { TBingo } from '../config/other-types/match';
import { InputData } from '../config/other-types/metadata';
import { convertData } from '../config/util-functions';
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
      if (req.body.board?.N.length > 2) {
        req.body.board.N[2] = 0;
      }
      // let board: TBingo[] = req.body.board;
      // if (Array.isArray(req.body.board)) {
      //   req.body.board = board.map((obj) => Object.values(obj));
      // }
      req.body.board = convertData(req.body.board);
    }
    next();
  }
);
export const addMultipleCartelaPipe = expressAsyncHandler(
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
      console.log(req.body.board);
      if (Array.isArray(req.body.board)) {
        for (let x = 0; x < req.body.board.length; x++) {
          if (req.body.board[x]?.N.length > 2) {
            req.body.board[x].N[2] = 0;
          }
          // if (req.body.board[x]?.length > 2) {
          //   if (req.body.board[x][2]?.N) {
          //     req.body.board[x][2].N = 0;
          //   }
          // }
          let board = req.body.board[x];
          console.log('BEFORE', board);
          req.body.board[x] = await convertData(board);
          console.log('I AM CONVERTEEEEEEEEEED', req.body.board[x]);
          // if (Array.isArray(req.body.board[x])) {
          //   req.body.board[x] = board.map((obj) => Object.values(obj));
          // }
        }
      }
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
      // if (req.body.board?.length > 2) {
      //   if (req.body.board[2]?.N) {
      //     req.body.board[2].N = 0;
      //   }
      // }
      // let board: TBingo[] = req.body.board;
      // if (Array.isArray(req.body.board)) {
      //   req.body.board = board.map((obj) => Object.values(obj));
      // }
      if (req.body.board?.N.length > 2) {
        req.body.board.N[2] = 0;
      }
      // let board: TBingo[] = req.body.board;
      // if (Array.isArray(req.body.board)) {
      //   req.body.board = board.map((obj) => Object.values(obj));
      // }
      req.body.board = await convertData(req.body.board);
    }
    next();
  }
);
