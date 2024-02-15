import express, { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { findByCompanyId } from '../services/company.service';
import { findById } from '../services/branch.service';
import {
  addUser,
  checkDuplication,
  checkDuplicationUpdate,
  findByUserId,
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
import { TOKEN_TYPE } from '../config/other-types/Enums';
import { encryptPassword } from '../services/auth.service';

export const get = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let data = await findUser();
    res.status(200).json({
      status: true,
      data,
    });
  }
);

export const getById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let id = req.params?.userID;
    const user = await findByUserId(id);
    res.status(200).json({
      status: true,
      data: user == null ? {} : user,
    });
  }
);

export const add = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const companyID: string = req.params?.companyID;
    const branchID: string = req.params?.branchID;

    const company = await findByCompanyId(companyID);
    let user = req.body;
    if (company == null)
      res.status(404).json({
        status: false,
        message: 'Company is not found!',
      });
    const branch = await findById(branchID, companyID);
    if (branch == null)
      res.status(404).json({
        status: false,
        message: 'Branch is not found!',
      });
    if (await checkDuplication(user.username, user.phone_number))
      res.status(402).json({
        status: false,
        message: 'User already exists!',
      });
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
