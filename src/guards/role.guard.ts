import expressAsyncHandler from 'express-async-handler';
import express, { Request, Response, NextFunction } from 'express';
import { GUARD_TYPES, ROLES } from '../config/other-types/Enums';

export const validateRole = (type: string) => {
  return expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!res?.locals?.users?.role)
        res.status(500).json({
          status: false,
          message: 'Role information is not found!',
        });

      if (type == GUARD_TYPES.all) {
        if (!Object.values(ROLES).includes(res.locals.users.role))
          res.status(401).json({
            status: false,
            message: 'User is not authorized to access the system',
          });
      } else if (type == GUARD_TYPES.superAdminAndAdmin) {
        if (
          res.locals.users.role !== ROLES.superAdmin &&
          res.locals.users.role !== ROLES.admin
        )
          res.status(401).json({
            status: false,
            message: 'User is not a super admin or admin!',
          });
      } else if (type == GUARD_TYPES.superAdmin) {
        if (res.locals.users.role !== ROLES.superAdmin)
          res.status(401).json({
            status: false,
            message: 'User is not a super admin!',
          });
      }
      next();
    }
  );
};
