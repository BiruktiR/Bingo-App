import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const validateSchema = (schema: ZodSchema) => {
  return expressAsyncHandler(
    async (req: Request, res: any, next: NextFunction) => {
      console.log(req.body);
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
