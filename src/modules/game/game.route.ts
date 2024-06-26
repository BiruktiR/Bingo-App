import express, { Router } from 'express';
import { validateSchema } from '../../config/global-utils/middlewares/validation.middleware';
import { validateToken } from '../../config/global-utils/middlewares/validate-token.middleware';
import { validateRole } from '../../config/global-utils/guards/role.guard';
import { GUARD_TYPES } from '../../config/other-types/Enums';

import { validationType } from '../../config/other-types/Enums';
import { AddGameSchema, CheckGameSchema, FindGameSchema } from './game.schema';
import { AddGamePipe, CheckGamePipe, FindGamePipe } from './game.pipe';
import {
  get,
  getById,
  add,
  checkWinner,
  deleteGame,
  disqualify,
} from './game.controller';

export const gameRouter: Router = express.Router();

gameRouter.get(
  '',
  validateToken,
  validateRole(GUARD_TYPES.all),
  FindGamePipe,
  validateSchema(FindGameSchema, validationType.query),
  get
);
gameRouter.get(
  '/:gameID',
  validateToken,
  validateRole(GUARD_TYPES.all),
  getById
);
gameRouter.post(
  '/check-winner/:cartelaID/:gameID',
  validateToken,
  validateRole(GUARD_TYPES.all),
  CheckGamePipe,
  validateSchema(CheckGameSchema, validationType.body),
  checkWinner
);
gameRouter.post(
  '/:branchID',
  validateToken,
  validateRole(GUARD_TYPES.all),
  AddGamePipe,
  validateSchema(AddGameSchema, validationType.body),
  add
);

gameRouter.delete(
  '/disqualify/:cartelaID/:gameID',
  validateToken,
  validateRole(GUARD_TYPES.all),
  disqualify
);
gameRouter.delete(
  '/:gameID',
  validateToken,
  validateRole(GUARD_TYPES.all),
  deleteGame
);
