import express, { Router } from 'express';
import { validateSchema } from '../../config/global-utils/middlewares/validation.middleware';
import { CompanySchema, FindCompanySchema } from './company.schema';
import { add, update, getById, get } from './company.controller';
import { validateToken } from '../../config/global-utils/middlewares/validate-token.middleware';
import { validateRole } from '../../config/global-utils/guards/role.guard';
import { GUARD_TYPES, validationType } from '../../config/other-types/Enums';
import { updateCompanyPipe } from './company.pipe';

export const companyRouter: Router = express.Router();

companyRouter.get(
  '',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  validateSchema(FindCompanySchema, validationType.query),
  get
);
companyRouter.get(
  '/:companyID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  getById
);
companyRouter.post(
  '',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  validateSchema(CompanySchema, validationType.body),
  add
);
companyRouter.put(
  '/:companyID',
  validateToken,
  validateRole(GUARD_TYPES.superAdmin),
  updateCompanyPipe,
  validateSchema(CompanySchema, validationType.body),
  update
);
