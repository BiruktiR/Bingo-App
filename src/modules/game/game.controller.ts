import { NextFunction, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { TAddCredit } from 'src/config/other-types/metadata';
import {
  NOTIFICATION_TYPE,
  RANDOM_TYPE,
  ROLES,
} from '../../config/other-types/Enums';
import {
  findIndexesOfNumber,
  getUTCDate,
  reverseConvertBoolean,
  reverseMatchBoard,
} from '../../config/util-functions/util-functions';
import { Cartela } from '../../db/entities/cartela.entity';
import { GameCartela } from '../../db/entities/game_cartela.entity';
import { findById } from '../branch/branch.service';
import { findCartelaById } from '../cartela/cartela.service';
import {
  addNotification,
  updateCredit,
} from '../user-credit/user-credit.service';
import { findAllUsersById } from '../user/user.service';
import { TGameSchema } from './game.schema';
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
} from './game.service';

export const get = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let role = res.locals.user.role;
    let user = await findAllUsersById(res.locals.user.id);
    let filters = req.query;

    if (filters?.start_date && res?.locals?.start_date) {
      filters.start_date = res.locals.start_date;
    }
    if (filters?.end_date && res?.locals?.end_date) {
      filters.end_date = res.locals.end_date;
    }

    let data = await findGame(role, user, filters);
    res.status(200).json({
      status: true,
      ...data,
      total_winnings: data.data.reduce((acc, obj) => {
        if ('total_won' in obj) {
          acc += obj.total_won;
        }
        return acc;
      }, 0),
      total_cuts: data.data.reduce((acc, obj) => {
        if ('cut' in obj) {
          acc += obj.cut;
        }
        return acc;
      }, 0),
      transactions: data.data.length,
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
    if (data !== null) {
      data.game_cartelas.map((y) => {
        return {
          id: y.id,
          cartela: y.cartela,
          game: y.game,
          matched_board: reverseMatchBoard(y.matched_board),
          attempts: y.attempts,
          is_fully_matched: y.is_fully_matched,
        };
      });
      data.pattern = reverseConvertBoolean(data.pattern);
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
      if (
        user.user_credit.current_credit <
        game.bet *
          game.cartelas.length *
          ((game.type * 5) / 100) *
          user.user_credit.percentage_cut
      )
        return res.status(401).json({
          status: false,
          message: 'You do not have enough credits to play the game',
        });
      if (user.user_credit.credit < 200)
        await addNotification(
          getUTCDate(),
          'Current credit is lower than 200',
          user,
          NOTIFICATION_TYPE.alert
        );
    }

    let cartela: Cartela[] = [];
    for (let x = 0; x < game.cartelas.length; x++) {
      let tempCartela = await findCartelaById(
        game.cartelas[x],
        role,
        branchID,
        false
      );
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
    const pattern: boolean[] = game.pattern.flat();
    const indexArray: number[] = await findIndexesOfNumber(pattern, true);

    const randomNumbers: number[] = await generateUniqueRandomNumbers(
      75,
      1,
      75,
      RANDOM_TYPE.raw
    );
    const generatedDate = getUTCDate();
    let savedGame = await addGame(
      randomNumbers,
      game.pattern,
      branch,
      generatedDate,
      game.type,
      user,
      game.bet
    );

    for (let x = 0; x < cartela.length; x++) {
      await addGameCartela(savedGame, cartela[x]);
    }

    if (role !== ROLES.superAdmin) {
      const currentCreditData: TAddCredit = {
        id: user.user_credit.id,
        percentageCut: user.user_credit.percentage_cut,
        credit: user.user_credit.credit,
        currentCredit:
          user.user_credit.current_credit -
          game.bet *
            game.cartelas.length *
            ((game.type * 5) / 100) *
            user.user_credit.percentage_cut,
      };
      await updateCredit(currentCreditData);
    }

    let finalOutput = await findGameById(savedGame.id);
    if (finalOutput !== null) {
      finalOutput.game_cartelas.map((y) => {
        return {
          id: y.id,
          cartela: y.cartela,
          game: y.game,
          matched_board: reverseMatchBoard(y.matched_board),
          attempts: y.attempts,
          is_fully_matched: y.is_fully_matched,
        };
      });
      finalOutput.pattern = reverseConvertBoolean(finalOutput.pattern);
    }

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
    let gameCartela = null;
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

    let isMatchedIndex = game.game_cartelas.findIndex(
      (x) => x.is_fully_matched === true
    );
    if (
      isMatchedIndex == -1 &&
      steps >
        game.game_cartelas.reduce((max, obj) => {
          return obj.attempts > max ? obj.attempts : max;
        }, -Infinity)
    ) {
      const pattern: boolean[] = game.pattern.flat();
      const indexArray: number[] = await findIndexesOfNumber(pattern, true);
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
      let winners = await findWinners(game.game_cartelas);
      if (winners.length > 0) {
        for (let y = 0; y < game.game_cartelas.length; y++) {
          if (
            !winners.some((winner) => winner.id === game.game_cartelas[y].id)
          ) {
            let { attempts, matchBoard, isFullyMatched } =
              await getBingoAttempts(
                indexArray,
                game.called_numbers,
                game.game_cartelas[y].cartela,
                winners[0].attempts
              );
            game.game_cartelas[y].attempts = attempts;
            game.game_cartelas[y].matched_board = matchBoard;
            game.game_cartelas[y].is_fully_matched = isFullyMatched;
          }
        }
      }
    }
    let winners = await findWinners(game.game_cartelas);

    let isWinner: boolean = false;

    if (winners.length > 0 && isMatchedIndex === -1) {
      for (let x = 0; x < game.game_cartelas.length; x++) {
        await updateGameCartela(game.game_cartelas[x]);
      }
    }
    let winner_cartela = await findAndRemoveObjectById(winners, cartelaID);
    isWinner = winner_cartela === null ? false : true;
    res.status(200).json({
      status: true,
      data: {
        game: {
          id: gameCartela.id,
          cartela: gameCartela.cartela,
          attempts: gameCartela.attempts,
          game: gameCartela.game,
          is_fully_matched: gameCartela.is_fully_matched,
          matched_board:
            gameCartela.matched_board !== null
              ? reverseMatchBoard(gameCartela.matched_board)
              : null,
        },
        is_winner: isWinner,
        other_winners: winners.map((x) => {
          return {
            id: x.id,
            cartela: x.cartela,
            game: x.game,
            attempts: x.attempts,
            matched_board:
              JSON.stringify(x.matched_board) !== null
                ? reverseMatchBoard(x.matched_board)
                : null,
            is_fully_matched: x.is_fully_matched,
          };
        }),
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
          message: 'Not allowed to delete game cartelas of other branch!',
        });
      }
    }
    await deleteCartelaFromGame(gameCartela.id);
    if (role !== ROLES.superAdmin) {
      let initialData =
        game.bet * ((game.type * 5) / 100) * user.user_credit.percentage_cut;

      const currentCreditData: TAddCredit = {
        id: user.user_credit.id,
        percentageCut: user.user_credit.percentage_cut,
        credit: user.user_credit.credit,
        currentCredit:
          user.user_credit.current_credit +
          (initialData * game.game_cartelas.length -
            initialData * game.game_cartelas.length -
            1),
      };
      await updateCredit(currentCreditData);
    }
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
          message: 'Not allowed to delete game of other branch!',
        });
      }
      const currentCreditData: TAddCredit = {
        id: user.user_credit.id,
        percentageCut: user.user_credit.percentage_cut,
        credit: user.user_credit.credit,
        currentCredit:
          user.user_credit.current_credit +
          game.bet *
            game.game_cartelas.length *
            ((game.type * 5) / 100) *
            user.user_credit.percentage_cut,
      };
      await updateCredit(currentCreditData);
    }
    await removeGame(gameID);
    res.status(200).json({
      status: true,
      message: 'Game is deleted successfully!',
    });
  }
);
