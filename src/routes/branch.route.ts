import express, { Router } from 'express';
import { validateSchema } from '../middlewares/validation.middleware';
import { BranchSchema } from '../config/zod-schemas/branch.schema';
import { add, update, getById, get } from '../controllers/branch.controller';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES } from '../config/other-types/Enums';
import { updateBranchPipe } from '../pipes/branch.pipe';

export const branchRouter: Router = express.Router();

branchRouter.get('', validateToken, validateRole(GUARD_TYPES.superAdmin), get);
branchRouter.get(
  '/:branchID/:companyID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  getById
);
branchRouter.post(
  '/:companyID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  validateSchema(BranchSchema),
  add
);
branchRouter.put(
  '/:branchID/:companyID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  updateBranchPipe,
  validateSchema(BranchSchema),
  update
);
