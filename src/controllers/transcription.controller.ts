import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { LANGUAGES } from '../config/other-types/Enums';
import { join } from 'path';
export const get = (type: string) => {
  return expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const audioName: string = req.params.audioName;
      res.sendFile(
        join(process.cwd(), `transcriptions/${type}/` + audioName + '.mp3')
      );
    }
  );
};
