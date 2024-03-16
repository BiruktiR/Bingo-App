import express, { Router } from 'express';
import { validateSchema } from '../middlewares/validation.middleware';
import { LoginSchema } from '../config/zod-schemas/login.schema';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES, validationType } from '../config/other-types/Enums';
import {
  addCartelaPipe,
  addMultipleCartelaPipe,
  updateCartelaPipe,
} from '../pipes/cartela.pipe';
import {
  CartelaSchema,
  FindCartelaSchema,
  MultipleCartelaSchema,
} from '../config/zod-schemas/cartela.schema';
import {
  get,
  getById,
  save,
  update,
  deleteCartela,
  saveMultiple,
} from '../controllers/cartela.controller';

export const cartelaRouter: Router = express.Router();
cartelaRouter.get(
  '',
  validateToken,
  validateRole(GUARD_TYPES.all),
  validateSchema(FindCartelaSchema, validationType.query),
  get
);
cartelaRouter.get(
  '/:cartelaID',
  validateToken,
  validateRole(GUARD_TYPES.all),
  getById
);

cartelaRouter.post(
  '/many/:branchID/:companyID',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  addMultipleCartelaPipe,
  validateSchema(MultipleCartelaSchema, validationType.body),
  saveMultiple
);
cartelaRouter.post(
  '/:branchID/:companyID',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  addCartelaPipe,
  validateSchema(CartelaSchema, validationType.body),
  save
);
cartelaRouter.put(
  '/:cartelaID',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  updateCartelaPipe,
  validateSchema(CartelaSchema, validationType.body),
  update
);
cartelaRouter.delete(
  '/:cartelaID',
  validateToken,
  validateRole(GUARD_TYPES.superAdminAndAdmin),
  deleteCartela
);
