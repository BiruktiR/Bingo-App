import express, { Router } from 'express';
import { validateSchema } from '../middlewares/validation.middleware';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES } from '../config/other-types/Enums';

import { validationType } from '../config/other-types/Enums';
import {
  AddGameSchema,
  CheckGameSchema,
  FindGameSchema,
} from '../config/zod-schemas/game.schema';
import { AddGamePipe, CheckGamePipe, FindGamePipe } from '../pipes/game.pipe';
import {
  get,
  getById,
  add,
  checkWinner,
  deleteGame,
  disqualify,
} from '../controllers/game.controller';

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
