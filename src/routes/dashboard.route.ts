import express, { Router } from 'express';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES } from '../config/other-types/Enums';
import { getDashboard } from '../controllers/dashboard.controller';

export const dashboardRouter: Router = express.Router();
dashboardRouter.get(
  '/:branchID',
  validateToken,
  validateRole(GUARD_TYPES.all),
  getDashboard
);
