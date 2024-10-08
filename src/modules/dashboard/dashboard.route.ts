import express, { Router } from 'express';
import { validateToken } from '../../config/global-utils/middlewares/validate-token.middleware';
import { validateRole } from '../../config/global-utils/guards/role.guard';
import { GUARD_TYPES } from '../../config/other-types/Enums';
import { getDashboard } from './dashboard.controller';

export const dashboardRouter: Router = express.Router();
dashboardRouter.get(
  '/:branchID',
  validateToken,
  validateRole(GUARD_TYPES.all),
  getDashboard
);
