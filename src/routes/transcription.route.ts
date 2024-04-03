import express, { NextFunction, Router, Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { validateSchema } from '../middlewares/validation.middleware';
import { validateToken } from '../middlewares/validate-token.middleware';
import { validateRole } from '../guards/role.guard';
import { GUARD_TYPES } from '../config/other-types/Enums';
import { join } from 'path';

export const transcriptionRouter: Router = express.Router();

transcriptionRouter.get(
  '/amharic/:audioName',
  expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const audioName: string = req.params.audioName;

      res.sendFile(join(process.cwd(), 'transcriptions/amharic/' + audioName));
    }
  )
);
