import { z, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

export const validateSchema = (schema: ZodSchema) => {
  return expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = schema.parse(req.body);
      if (result?.success) {
        const formatted = result.error.format();
        res.status(404).json(formatted);
      }
      next();
    }
  );
};
