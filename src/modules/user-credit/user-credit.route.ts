import express, { Router } from 'express';
import { validateSchema } from '../../config/global-utils/middlewares/validation.middleware';
import { validateToken } from '../../config/global-utils/middlewares/validate-token.middleware';
import { GUARD_TYPES, ROLES } from '../../config/other-types/Enums';
import { validateRole } from '../../config/global-utils/guards/role.guard';
import { validationType } from '../../config/other-types/Enums';
import {
  AddUserCreditPipe,
  FindTransferHistoryPipe,
  TranferCreditPipe,
} from './user-credit.pipe';
import {
  AddUserCreditSchema,
  FindTransferHistorySchema,
  TransferCreditSchema,
} from './user-credit.schema';
import {
  getById,
  get,
  addGameCredit,
  transferCredit,
  findTransferHistory,
} from './user-credit.controller';
export const userCreditRouter: Router = express.Router();

userCreditRouter.get(
  '',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  get
);

userCreditRouter.get(
  '/:userCreditID',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  getById
);
userCreditRouter.get(
  '/transfer-history',
  validateToken,
  validateRole(GUARD_TYPES.all),
  FindTransferHistoryPipe,
  validateSchema(FindTransferHistorySchema, validationType.query),
  findTransferHistory
);
userCreditRouter.post(
  '/:userID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  AddUserCreditPipe,
  validateSchema(AddUserCreditSchema, validationType.body),
  addGameCredit
);

userCreditRouter.post(
  '/credit-transfer/:userID',
  validateToken,
  validateRole(GUARD_TYPES.adminCashier),
  TranferCreditPipe,
  validateSchema(TransferCreditSchema, validationType.body),
  transferCredit
);
