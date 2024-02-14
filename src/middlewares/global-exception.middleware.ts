import { Request, Response, NextFunction } from 'express';
import { AppError } from '../config/other-types/AppError';

export const globalValidation = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || 'Something went wrong!';
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
};
