import { AppDataSource } from '../../db/data-source';
import { TFindUserSchema, TUser } from './user.schema';
import { Brackets, Not } from 'typeorm';
import { Branch } from '../../db/entities/branch.entity';
import { User } from '../../db/entities/user.entity';
import { Token } from '../../db/entities/token.entity';
import { encryptPassword } from '../auth/auth.service';
import { ROLES, TOKEN_TYPE } from '../../config/other-types/Enums';
import { generateToken, registerToken } from '../auth/token.service';
import { MetadataType } from '../../config/other-types/metadata';
import { generateMetadata } from '../../config/util-functions/generate-metadata';
import { UserCredit } from '../../db/entities/user-credit.entity';

const userRepository = AppDataSource.getRepository(User);

export const findUser = async (
  role: string,
  branchID: string,
  filters: TFindUserSchema
) => {
  let data = await userRepository
    .createQueryBuilder('users')
    .leftJoinAndSelect('users.branch', 'branch')
    .leftJoinAndSelect('branch.company', 'company');
  if (role !== ROLES.superAdmin) {
    await data.andWhere('branch.id=:branchID', { branchID: branchID });
    await data.andWhere('users.role!=:adminRole', {
      adminRole: ROLES.superAdmin,
    });
  }

  if (filters?.id)
    await data.andWhere('users.id=:userID', { userID: filters.id });
  if (filters?.full_name)
    await data.andWhere('users.full_name like :fullName', {
      fullName: `%${filters.full_name}%`,
    });
  if (filters?.username)
    await data.andWhere('users.username like :userName', {
      userName: `%${filters.username}%`,
    });
  if (filters?.phone_number)
    await data.andWhere('users.phone_number like :phoneNumber', {
      phoneNumber: `%${filters.phone_number}%`,
    });
  if (filters?.companyID)
    await data.andWhere('company.id=:companyID', {
      companyID: filters.companyID,
    });
  if (filters?.branchID)
    await data.andWhere('branch.id=:branchID', { branchID: filters.branchID });
  let page: number = !Number.isNaN(parseInt(filters.page))
    ? parseInt(filters.page)
    : 1;
  let limit: number = !Number.isNaN(parseInt(filters.limit))
    ? parseInt(filters.limit)
    : 20;
  let offset: number = limit * (page - 1);

  await data.skip(offset).take(limit);
  let count: number = await data.getCount();

  const metadata: MetadataType = await generateMetadata(page, limit, count);

  return {
    metadata: metadata,
    data: (await data.getMany()).map((data) => {
      return {
        id: data.id,
        full_name: data.full_name,
        username: data.username,
        phone_number: data.phone_number,
        role: data.role,
        is_verified: data.is_verified,
        status: data.status,
        branch: data.branch,
      };
    }),
  };
};

export const findByUserId = async (id: string) => {
  return userRepository.findOne({
    relations: {
      branch: true,
      token: true,
      user_credit: true,
    },
    where: {
      id: id,
      role: Not('SUPERADMIN'),
    },
  });
};
export const findAllUsersById = async (id: string) => {
  return await userRepository
    .createQueryBuilder('users')
    .leftJoinAndSelect('users.branch', 'branch')
    .leftJoinAndSelect('branch.company', 'company')
    .leftJoinAndSelect('users.token', 'token')
    .leftJoinAndSelect('users.user_credit', 'user_credit')
    .where('users.id=:userID', { userID: id })
    .getOne();
};
export const findByUserIdRoleBased = async (
  id: string,
  role: string,
  branchID: string
) => {
  let data = await userRepository
    .createQueryBuilder('users')
    .leftJoinAndSelect('users.branch', 'branch')
    .where('users.id=:userID', { userID: id });
  if (role !== ROLES.superAdmin)
    await data.where('branch.id=:branchID', { branchID: branchID });
  return data.getOne();
};

export const findByUsername = async (username: string) => {
  return userRepository.findOne({
    relations: {
      branch: true,
      token: true,
    },
    where: {
      username: username,
      role: Not(ROLES.superAdmin),
    },
  });
};
export const findAllUsersWithoutAdminCredit = async () => {
  return userRepository
    .createQueryBuilder('users')
    .leftJoinAndSelect('users.branch', 'branch')
    .leftJoinAndSelect('users.token', 'token')
    .leftJoinAndSelect('users.user_credit', 'user_credit')
    .where('users.role!= :superAdmin', { superAdmin: ROLES.superAdmin })
    .andWhere('users.userCreditId IS NULL')
    .getMany();
};
export const findByUsernameForLogin = async (username: string) => {
  return await userRepository
    .createQueryBuilder('users')
    .leftJoinAndSelect('users.branch', 'branch')
    .leftJoinAndSelect('branch.company', 'company')
    .leftJoinAndSelect('users.token', 'token')
    .where('users.username=:userName', { userName: username })
    .getOne();
};
export const findBySuperAdminRole = async () => {
  return userRepository.findOne({
    relations: {
      branch: true,
      token: true,
    },
    where: {
      role: 'SUPERADMIN',
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
export const checkAdminInBranch = async (branchID: string) => {
  const user = await userRepository.findOne({
    relations: {
      branch: true,
    },
    where: {
      role: ROLES.admin,
      branch: {
        id: branchID,
      },
    },
  });
  return user?.id;
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
export const registerTokenAndCreditForUser = async (
  id: string,
  token: Token,
  userCredit: UserCredit
) => {
  await userRepository.update(
    { id: id },
    { token: token, user_credit: userCredit }
  );
  return;
};
export const registerCreditForExistingUser = async (
  id: string,
  userCredit: UserCredit
) => {
  await userRepository.update({ id: id }, { user_credit: userCredit });
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

  await registerTokenAndCreditForUser(createdUser.id, tokenObject, null);
  return;
};
export const changePassword = async (id: string, password: string) => {
  await userRepository.update({ id: id }, { password: password });
};
