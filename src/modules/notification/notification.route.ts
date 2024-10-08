import express, { Router } from 'express';
import { validateSchema } from '../../config/global-utils/middlewares/validation.middleware';
import { validateToken } from '../../config/global-utils/middlewares/validate-token.middleware';
import { validateRole } from '../../config/global-utils/guards/role.guard';
import { GUARD_TYPES } from '../../config/other-types/Enums';
import { validationType } from '../../config/other-types/Enums';
import { FindNotificationPipe } from './notification.pipe';
import { FindNotificationSchema } from './notification.schema';
import { getNotification } from './notification.controller';

export const notificationRouter: Router = express.Router();

notificationRouter.get(
  '',
  validateToken,
  validateRole(GUARD_TYPES.all),
  FindNotificationPipe,
  validateSchema(FindNotificationSchema, validationType.query),
  getNotification
);
