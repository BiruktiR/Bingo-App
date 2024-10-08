import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { validationType } from '../../other-types/Enums';

export const validateSchema = (schema: ZodSchema, type: string) => {
  return expressAsyncHandler(
    async (req: Request, res: any, next: NextFunction) => {
      const data = type == validationType.body ? req.body : req.query;
      console.log(data);

      const result = schema.safeParse(req.body);
      if (result?.success == false) {
        return res.status(404).json({
          status: false,
          issues: result.error.format(),
        });
      }
      next();
    }
  );
};
