import express, { Router } from 'express';
import { validateSchema } from '../middlewares/validation.middleware';
import {
  BranchSchema,
  FindBranchSchema,
} from '../config/zod-schemas/branch.schema';
import { add, update, getById, get } from '../controllers/branch.controller';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES } from '../config/other-types/Enums';
import { updateBranchPipe } from '../pipes/branch.pipe';
import { validationType } from '../config/other-types/Enums';

export const branchRouter: Router = express.Router();

branchRouter.get(
  '',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  validateSchema(FindBranchSchema, validationType.query),
  get
);
branchRouter.get(
  '/:branchID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  getById
);
branchRouter.post(
  '/:companyID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  validateSchema(BranchSchema, validationType.body),
  add
);
branchRouter.put(
  '/:branchID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  updateBranchPipe,
  validateSchema(BranchSchema, validationType.body),
  update
);
