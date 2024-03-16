import express, { Router } from 'express';
import { validateSchema } from '../middlewares/validation.middleware';
import {
  CompanySchema,
  FindCompanySchema,
} from '../config/zod-schemas/company.schema';
import { add, update, getById, get } from '../controllers/company.controller';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES, validationType } from '../config/other-types/Enums';
import { updateCompanyPipe } from '../pipes/company.pipe';

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
