import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findByCompanyId } from '../services/company.service';
import { findById } from '../services/branch.service';
import {
  addUser,
  checkAdminInBranch,
  checkDuplication,
  checkDuplicationUpdate,
  findByUserId,
  findByUserIdRoleBased,
  findByUsername,
  findUser,
  registerTokenForUser,
  updateUser,
} from '../services/user.service';
import {
  generateToken,
  registerToken,
  updateToken,
} from '../services/token.service';
import { ROLES, TOKEN_TYPE } from '../config/other-types/Enums';
import { encryptPassword } from '../services/auth.service';
import { TFindUserSchema } from 'src/config/zod-schemas/user.schema';

export const get = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const role: string = res.locals.user.role;
    const user = await findByUserId(res.locals.user?.id);
    const filters: TFindUserSchema = req.query;

    let data = await findUser(role, user?.branch?.id, filters);
    res.status(200).json({
      status: true,
      ...data,
    });
  }
);

export const getById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let id = req.params?.userID;
    const role: string = res.locals.user.role;
    const usr = await findByUserId(res.locals.user?.id);
    const user = await findByUserIdRoleBased(id, role, usr?.branch?.id);
    res.status(200).json({
      status: true,
      data: user == null ? {} : user,
    });
  }
);

export const add = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    const companyID: string = req.params?.companyID;
    const branchID: string = req.params?.branchID;
    const role: string = res?.locals?.user?.role;

    const company = await findByCompanyId(companyID);
    let user = req.body;

    if (company == null)
      return res.status(404).json({
        status: false,
        message: 'Company is not found!',
      });
    const branch = await findById(branchID);
    if (branch == null)
      return res.status(404).json({
        status: false,
        message: 'Branch is not found!',
      });
    if (branch?.company?.id !== companyID)
      return res.status(400).json({
        status: false,
        message: 'Branch does not exist in the provided company',
      });
    if (await checkDuplication(user.username, user.phone_number))
      return res.status(402).json({
        status: false,
        message: 'User already exists!',
      });
    if (checkAdminInBranch(branchID) === undefined)
      return res.status(400).json({
        status: false,
        message: 'Admin already exists in the branch!',
      });
    if (role == ROLES.admin) {
      if (req.body.role == ROLES.admin) {
        return res.status(401).json({
          status: false,
          message: 'Admin is not allowed to add admin users!',
        });
      }
      if (branchID !== (await findByUserId(res?.locals?.user?.id)).branch?.id) {
        return res.status(401).json({
          status: false,
          message: 'Provided user branch does not match admin branch! ',
        });
      }
    }

    user.password = await encryptPassword(user.password);
    await addUser(user, branch);

    let addedUser = await findByUsername(user.username);

    const token = generateToken(TOKEN_TYPE.refresh, {
      id: addedUser.id,
      role: addedUser.role,
    });
    const tokenObject = await registerToken(token);

    await registerTokenForUser(addedUser.id, tokenObject);

    res.status(200).json({
      status: true,
      message: 'User is added successfully!',
    });
  }
);
export const update = expressAsyncHandler(
  async (req: Request, res: any, next: NextFunction) => {
    const userID: string = req?.params?.userID;
    const updaterUserID: string = res?.locals?.user?.id;
    const updaterUser = await findByUserId(updaterUserID);
    const role: string = res?.locals?.user?.role;
    //const branchID: string = res.locals.branchID;
    let user = await findByUserId(userID);

    if (user.id == null)
      return res.status(404).json({
        status: false,
        message: 'User is not found!',
      });
    // if (user?.branch?.id != branchID)
    //   res.status(302).json({
    //     status: false,
    //     message: 'User does not belong in this branch',
    //   });
    if (
      await checkDuplicationUpdate(
        req.body.username,
        req.body.phone_number,
        userID
      )
    ) {
      console.log(
        await checkDuplicationUpdate(
          req.body.username,
          req.body.phone_number,
          userID
        )
      );
      return res.status(402).json({
        status: false,
        message: 'User already exists!',
      });
    }
    const adminId = await checkAdminInBranch(user.branch.id);
    if (
      adminId !== undefined &&
      req.body.role === ROLES.admin &&
      adminId !== userID
    ) {
      return res.status(400).json({
        status: false,
        message: 'Admin already exists in the branch!',
      });
    }
    if (role === ROLES.admin) {
      if (updaterUser.branch.id !== user.branch.id) {
        return res.status(401).json({
          status: false,
          message: 'Cannot update user of different branch!',
        });
      }
    }
    req.body.password =
      req.body.password == 'not password'
        ? user.password
        : await encryptPassword(req.body.password);
    const updatedUser = await updateUser(req.body, userID);
    const token = generateToken(TOKEN_TYPE.refresh, {
      id: updatedUser.id,
      role: updatedUser.role,
    });
    await updateToken(updatedUser.token.id, token);
    res.status(200).json({
      status: true,
      message: 'User is updated successfully!',
      data: updatedUser,
    });
  }
);
