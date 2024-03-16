import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { TGameSchema } from '../config/zod-schemas/game.schema';
import { RANDOM_TYPE, ROLES } from '../config/other-types/Enums';
import { findAllUsersById } from '../services/user.service';
import { findById } from '../services/branch.service';
import { Cartela } from '../db/entities/cartela.entity';
import { findCartelaById } from '../services/cartela.service';
import { findIndexesOfNumber, getDate } from '../config/util-functions';
import {
  addGame,
  addGameCartela,
  deleteCartelaFromGame,
  findAndRemoveObjectById,
  findGame,
  findGameById,
  findWinners,
  generateUniqueRandomNumbers,
  getBingoAttempts,
  removeGame,
  updateGameCartela,
} from '../services/game.service';
import { GameCartela } from '../db/entities/game_cartela.entity';
import { match } from 'assert';

export const get = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);
    let filters = req.query;
    let data = await findGame(role, user, filters);
    res.status(200).json({
      status: true,
      ...data,
    });
  }
);

export const getById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);
    let gameID = req?.params?.gameID;
    let data = await findGameById(gameID);
    if (data !== null) {
      if (role !== ROLES.superAdmin && user.branch.id !== data.branch.id) {
        data = null;
      }
    }
    res.status(200).json({
      status: true,
      data: data,
    });
  }
);

export const add = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let game: TGameSchema = req.body;
    const branchID: string = req?.params?.branchID;
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);

    let branch = await findById(branchID);
    if (branch === null)
      return res.status(404).json({
        status: false,
        message: 'Branch is not found!',
      });
    if (role !== ROLES.superAdmin) {
      if (user.branch.id !== branchID)
        return res.status(401).json({
          status: false,
          message: "Player branch doesn't match provided branch!",
        });
    }
    let cartela: Cartela[] = [];
    for (let x = 0; x < game.cartelas.length; x++) {
      let tempCartela = await findCartelaById(game.cartelas[x], role, branchID);
      if (tempCartela == null)
        return res.status(404).json({
          status: false,
          message: 'Cartela is not found!',
        });
      let cart = new Cartela();
      cart.id = tempCartela.id;
      (cart.board = JSON.stringify(tempCartela.board)),
        (cart.branch = tempCartela.branch);
      cartela.push(cart);
    }
    const pattern: number[] = game.pattern.flat();
    const indexArray: number[] = await findIndexesOfNumber(pattern, 1);
    const randomNumbers: number[] = await generateUniqueRandomNumbers(
      75,
      1,
      75,
      RANDOM_TYPE.raw
    );
    const generatedDate: string = await getDate();
    let savedGame = await addGame(
      randomNumbers,
      game.pattern,
      branch,
      generatedDate,
      game.type,
      user,
      game.bet
    );
    cartela.forEach(async (x) => {
      // let { attempts, matchBoard } = await getBingoAttempts(
      //   indexArray,
      //   randomNumbers,
      //   x
      // );
      await addGameCartela(savedGame, x);
    });
    let finalOutput = await findGameById(savedGame.id);

    res.status(200).json({
      status: true,
      message: 'Game is added successfully!',
      data: {
        ...finalOutput,
      },
    });
  }
);

export const checkWinner = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let cartelaID = parseInt(req.params.cartelaID);
    if (isNaN(cartelaID))
      return res.status(400).json({
        status: false,
        message: 'Cartela id is not number',
      });
    let steps: number = req.body.steps;
    let gameID = req.params.gameID;
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);
    let game = await findGameById(gameID);
    if (game == null)
      return res.status(404).json({
        status: false,
        message: 'Game is not found!',
      });
    let gameCartela: GameCartela = null;
    for (let x = 0; x < game.game_cartelas.length; x++) {
      if (cartelaID === game.game_cartelas[x].cartela.id) {
        gameCartela = game.game_cartelas[x];
        x = game.game_cartelas.length;
      }
    }
    if (gameCartela == null)
      return res.status(404).json({
        status: false,
        message: `Cartela ${cartelaID} wasn't played in the current game!`,
      });
    if (role !== ROLES.superAdmin) {
      if (game.branch.id !== user.branch.id) {
        return res.status(401).json({
          status: false,
          message: 'Not allowed to update game of other branch!',
        });
      }
    }
    if (
      game.game_cartelas.findIndex((x) => x.is_fully_matched === true) == -1 &&
      steps >
        game.game_cartelas.reduce((max, obj) => {
          return obj.attempts > max ? obj.attempts : max;
        }, -Infinity)
    ) {
      const pattern: number[] = game.pattern.flat();
      const indexArray: number[] = await findIndexesOfNumber(pattern, 1);
      for (let x = 0; x < game.game_cartelas.length; x++) {
        let { attempts, matchBoard, isFullyMatched } = await getBingoAttempts(
          indexArray,
          game.called_numbers,
          game.game_cartelas[x].cartela,
          steps
        );
        game.game_cartelas[x].attempts = attempts;
        game.game_cartelas[x].matched_board = matchBoard;
        game.game_cartelas[x].is_fully_matched = isFullyMatched;
      }
    }
    let winners = await findWinners(game.game_cartelas);
    let isWinner: boolean = false;
    if (winners.length > 0) {
      for (let x = 0; x < game.game_cartelas.length; x++) {
        await updateGameCartela(game.game_cartelas[x]);
      }
      let winner_cartela = await findAndRemoveObjectById(winners, cartelaID);
      isWinner = winner_cartela === null ? false : true;
    }
    res.status(200).json({
      status: true,
      data: {
        game: gameCartela,
        is_winner: isWinner,
        other_winners: winners,
      },
    });
  }
);
export const disqualify = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let cartelaID = parseInt(req.params.cartelaID);
    if (isNaN(cartelaID))
      return res.status(400).json({
        status: false,
        message: 'Cartela id is not number',
      });
    let steps: number = req.body.steps;
    let gameID = req.params.gameID;
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);
    let game = await findGameById(gameID);
    if (game == null)
      return res.status(404).json({
        status: false,
        message: 'Game is not found!',
      });
    let gameCartela: GameCartela = null;
    for (let x = 0; x < game.game_cartelas.length; x++) {
      if (cartelaID === game.game_cartelas[x].cartela.id) {
        gameCartela = game.game_cartelas[x];
        x = game.game_cartelas.length;
      }
    }
    if (gameCartela == null)
      return res.status(404).json({
        status: false,
        message: `Cartela ${cartelaID} wasn't played in the current game!`,
      });
    if (role !== ROLES.superAdmin) {
      if (game.branch.id !== user.branch.id) {
        return res.status(401).json({
          status: false,
          message: 'Not allowed to update game of other branch!',
        });
      }
    }
    await deleteCartelaFromGame(gameCartela.id);
    res.status(200).json({
      status: true,
      message: 'Cartela is removed from game successfully!',
    });
  }
);
export const deleteGame = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    let gameID = req.params.gameID;
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);
    let game = await findGameById(gameID);
    if (game == null)
      return res.status(404).json({
        status: false,
        message: 'Game is not found!',
      });
    if (role !== ROLES.superAdmin) {
      if (game.branch.id !== user.branch.id) {
        return res.status(401).json({
          status: false,
          message: 'Not allowed to update game of other branch!',
        });
      }
    }
    await removeGame(gameID);
    res.status(200).json({
      status: true,
      message: 'Game is deleted successfully!',
    });
  }
);
