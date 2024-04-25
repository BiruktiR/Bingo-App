import express, { NextFunction, Router, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { validateSchema } from '../../config/global-utils/middlewares/validation.middleware';
import { validateToken } from '../../config/global-utils/middlewares/validate-token.middleware';
import { validateRole } from '../../config/global-utils/guards/role.guard';
import { GUARD_TYPES, LANGUAGES } from '../../config/other-types/Enums';

import { get } from './transcription.controller';

export const transcriptionRouter: Router = express.Router();

transcriptionRouter.get('/amharic/:audioName', get(LANGUAGES.amharic));
transcriptionRouter.get('/oromiffa/:audioName', get(LANGUAGES.oromiffa));
