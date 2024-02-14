import { AppDataSource } from '../db/data-source';
import { TUser } from '../config/zod-schemas/user.schema';
import { Brackets, Not } from 'typeorm';
import { Branch } from '../db/entities/branch.entity';
import { User } from '../db/entities/user.entity';
import { Token } from '../db/entities/token.entity';
import { encryptPassword } from './auth.service';
import { ROLES, TOKEN_TYPE } from '../config/other-types/Enums';
import { generateToken, registerToken } from './token.service';

const userRepository = AppDataSource.getRepository(User);

export const findUser = async () => {
  return userRepository.find();
};

export const findByUserId = async (id: string) => {
  return userRepository.findOne({
    relations: {
      branch: true,
      token: true,
    },
    where: {
      id: id,
      role: Not('SUPER_ADMIN'),
    },
  });
};

export const findByUsername = async (username: string) => {
  return userRepository.findOne({
    relations: {
      branch: true,
      token: true,
    },
    where: {
      username: username,
      role: Not('SUPER_ADMIN'),
    },
  });
};
export const findBySuperAdminRole = async () => {
  return userRepository.findOne({
    relations: {
      branch: true,
      token: true,
    },
    where: {
      role: 'SUPER_ADMIN',
    },
  });
};
export const checkDuplication = async (
  username: string,
  phoneNumber: string
): Promise<boolean> => {
  const user = await userRepository
    .createQueryBuilder('users')
    .where('users.username = :username', { username: username })
    .orWhere('users.phone_number = :phoneNumber', { phoneNumber: phoneNumber })
    .getOne();
  return user == null ? false : true;
};
export const addUser = async (user: TUser, branch: Branch) => {
  await userRepository.save({
    ...user,
    branch: branch,
  });
  return;
};
export const checkDuplicationUpdate = async (
  username: string,
  phoneNumber: string,
  id: string
): Promise<boolean> => {
  const user = await userRepository
    .createQueryBuilder('users')
    .where('users.id!= :userID', { userID: id })
    .andWhere(
      new Brackets((qb) => {
        qb.where('users.username = :username', { username: username }).orWhere(
          'users.phone_number = :phoneNumber',
          { phoneNumber: phoneNumber }
        );
      })
    )
    .getOne();
  return user == null ? false : true;
};
export const updateUser = async (user: TUser, id: string) => {
  await userRepository.update({ id: id }, { ...user });
  return findByUserId(id);
};
export const registerTokenForUser = async (id: string, token: Token) => {
  await userRepository.update({ id: id }, { token: token });
  return;
};
export const initializeSuperAdmin = async () => {
  const user = await findBySuperAdminRole();
  const password: string = await encryptPassword(process.env.USER_PASSWORD);
  if (user !== null) return;
  let createdUser = new User();
  (createdUser.full_name = process.env.USER_FULL_NAME),
    (createdUser.username = process.env.USER_NAME),
    (createdUser.phone_number = process.env.USER_PHONE_NUMBER),
    (createdUser.password = password),
    (createdUser.role = ROLES.superAdmin),
    await userRepository.save(createdUser);
  const token = generateToken(TOKEN_TYPE.refresh, {
    id: createdUser.id,
    role: createdUser.role,
  });
  const tokenObject = await registerToken(token);

  await registerTokenForUser(createdUser.id, tokenObject);
  return;
};
