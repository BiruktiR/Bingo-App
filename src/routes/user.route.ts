import express, { Router } from 'express';
import { validateSchema } from '../middlewares/validation.middleware';
import { FindUserSchema, UserSchema } from '../config/zod-schemas/user.schema';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES, validationType } from '../config/other-types/Enums';
import { addUserPipe, updateUserPipe } from '../pipes/user.pipe';
import { add, get, getById, update } from '../controllers/user.controller';

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
