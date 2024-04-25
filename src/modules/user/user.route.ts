import express, { Router } from 'express';
import { validateSchema } from '../../config/global-utils/middlewares/validation.middleware';
import { FindUserSchema, UserSchema } from './user.schema';
import { validateToken } from '../../config/global-utils/middlewares/validate-token.middleware';
import { validateRole } from '../../config/global-utils/guards/role.guard';
import { GUARD_TYPES, validationType } from '../../config/other-types/Enums';
import { addUserPipe, updateUserPipe } from './user.pipe';
import { add, get, getById, update } from './user.controller';

export const userRouter: Router = express.Router();
userRouter.get(
  '',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  validateSchema(FindUserSchema, validationType.query),
  get
);
userRouter.get(
  '/:userID',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  getById
);
userRouter.post(
  '/register/:companyID/:branchID',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  addUserPipe,
  validateSchema(UserSchema, validationType.body),
  add
);
userRouter.put(
  '/:userID',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  updateUserPipe,
  validateSchema(UserSchema, validationType.body),
  update
);
