import express, { NextFunction, Router, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { validateSchema } from '../middlewares/validation.middleware';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES, LANGUAGES } from '../config/other-types/Enums';

import { get } from '../controllers/transcription.controller';

export const transcriptionRouter: Router = express.Router();

transcriptionRouter.get('/amharic/:audioName', get(LANGUAGES.amharic));
transcriptionRouter.get('/oromiffa/:audioName', get(LANGUAGES.oromiffa));
