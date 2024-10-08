import { AppDataSource } from '../../db/data-source';
import { UserCredit } from '../../db/entities/user-credit.entity';
import {
  TAddUserCreditSchema,
  TFindTransferHistorySchema,
  TFindUserCreditSchema,
} from './user-credit.schema';
import { User } from '../../db/entities/user.entity';
import { ROLES, TRANSFER_TYPE } from '../../config/other-types/Enums';
import { MetadataType, TAddCredit } from '../../config/other-types/metadata';
import { generateMetadata } from '../../config/util-functions/generate-metadata';
import { TransferHistory } from '../../db/entities/transfer-history.entity';
import {
  getEthiopianDate,
  getUTCDate,
} from '../../config/util-functions/util-functions';
import { Notification } from '../../db/entities/notification.entity';
import {
  findAllUsersWithoutAdminCredit,
  registerCreditForExistingUser,
} from '../user/user.service';

const userCreditRepository = AppDataSource.getRepository(UserCredit);
const transferHistoryRepository = AppDataSource.getRepository(TransferHistory);
const notificationRepository = AppDataSource.getRepository(Notification);
export const FindUserCredit = async (filters: TFindUserCreditSchema) => {
  let userCredit = await userCreditRepository
    .createQueryBuilder('user_credits')
    .leftJoinAndSelect('user_credits.user', 'user')
    .leftJoinAndSelect('user.branch', 'branch')
    .leftJoinAndSelect('branch.company', 'company')
    .where('user.role=:userRole', { userRole: ROLES.admin });
  if (filters?.id)
    userCredit.andWhere('user_credits.id=:userCreditID', {
      userCreditID: filters?.id,
    });
  if (filters?.userID)
    userCredit.andWhere('user.id=:userID', { userID: filters?.userID });
  if (filters?.companyID)
    userCredit.andWhere('company.id=:companyID', {
      companyID: filters?.companyID,
    });
  if (filters?.branchID)
    userCredit.andWhere('branch.id=:branchID', {
      branchID: filters?.branchID,
    });
  let page: number = !Number.isNaN(parseInt(filters.page))
    ? parseInt(filters.page)
    : 1;
  let limit: number = !Number.isNaN(parseInt(filters.limit))
    ? parseInt(filters.limit)
    : 51;
  let offset: number = limit * (page - 1);
  await userCredit.skip(offset).take(limit);
  let count: number = await userCredit.getCount();
  const metadata: MetadataType = await generateMetadata(page, limit, count);
  return {
    metadata: metadata,
    data: await userCredit.getMany(),
  };
};
export const findTransfer = async (
  filters: TFindTransferHistorySchema,
  role: string,
  user: User
) => {
  let transferHistory = await transferHistoryRepository
    .createQueryBuilder('transfer_histories')
    .leftJoinAndSelect('transfer_histories.sender', 'sender')
    .leftJoinAndSelect('transfer_histories.receiver', 'receiver');
  if (role == ROLES.admin) {
    transferHistory.andWhere((qb) => {
      qb.orWhere('sender.branchId=:senderBranch', {
        senderBranch: user.branch.id,
      });
      qb.orWhere('receiver.branchId=:receiverBranch', {
        receiverBranch: user.branch.id,
      });
    });
  }
  if (role == ROLES.cashier) {
    transferHistory.andWhere((qb) => {
      qb.orWhere('sender.id=:senderTransferID', { senderTransferID: user.id });
      qb.orWhere('receiver.id=:receiverTransferID', {
        receiverTransferID: user.id,
      });
    });
  }
  if (filters?.id)
    transferHistory.andWhere('transfer_histories.id=:transferHistoryID', {
      transferHistoryID: filters?.id,
    });
  if (filters?.senderID)
    transferHistory.andWhere('sender.id=:senderID', {
      senderID: filters?.senderID,
    });
  if (filters?.receiverID)
    transferHistory.andWhere('receiver.id=:receiverID', {
      receiverID: filters?.receiverID,
    });
  if (filters?.start_date)
    transferHistory.andWhere('transfer_histories.sent_at >= :startDate', {
      startDate: filters.start_date,
    });
  if (filters?.end_date)
    transferHistory.andWhere('transfer_histories.sent_at <= :endDate', {
      endDate: filters.end_date,
    });
  let page: number = !Number.isNaN(parseInt(filters.page))
    ? parseInt(filters.page)
    : 1;
  let limit: number = !Number.isNaN(parseInt(filters.limit))
    ? parseInt(filters.limit)
    : 51;
  let offset: number = limit * (page - 1);

  await transferHistory.skip(offset).take(limit);
  let count: number = await transferHistory.getCount();

  const metadata: MetadataType = await generateMetadata(page, limit, count);
  return {
    metadata: metadata,
    data: (await transferHistory.getMany()).map((x) => {
      return {
        id: x.id,
        credit: x.credit,
        sender: x.sender,
        receiver: x.receiver,
        sent_at: getEthiopianDate(x.sent_at),
      };
    }),
  };
};
export const findUserCreditById = async (id: string) => {
  return userCreditRepository
    .createQueryBuilder('user_credits')
    .leftJoinAndSelect('user_credits.user', 'user')
    .leftJoinAndSelect('user.branch', 'branch')
    .leftJoinAndSelect('branch.company', 'company')
    .where('user_credits.id=:userCreditID', {
      userCreditID: id,
    })
    .getOne();
};

export const addUserCredit = async (user: User) => {
  let user_credit = userCreditRepository.create({
    credit: 0,
    percentage_cut: 0,
    current_credit: 0,
    user: user,
  });
  await userCreditRepository.save(user_credit);
  return user_credit;
};
export const updateUserCredit = async (data: any, previousData: UserCredit) => {
  console.log('THIS IS DATA', data);
  console.log('THIS IS SECOND DATA', previousData);
  let credit = data.credit + previousData.credit;
  let percentage_cut = data.percentage_cut;
  let current_credit = previousData.current_credit + data.credit;
  await userCreditRepository.update(
    { id: previousData.id },
    {
      credit: credit,
      percentage_cut: percentage_cut,
      current_credit: current_credit,
    }
  );
};
export const transferUserCredit = async (
  credit: number,
  user: User,
  receiver: User
) => {
  let transferHistory = transferHistoryRepository.create({
    credit: credit,
    sender: user,
    receiver: receiver,
    sent_at: getUTCDate(),
  });
  await transferHistoryRepository.save(transferHistory);
  return transferHistory;
};
export const addNotification = async (
  date: Date,
  message: string,
  user: User,
  type: string
) => {
  let notification = await notificationRepository.create({
    date: date,
    notification: message,
    user: user,
    type: type,
  });
  await notificationRepository.save(notification);
  return notification;
};
export const generateNotificationMessage = (
  type: string,
  firstName: string,
  secondName: string,
  credit: number
) => {
  if (type === TRANSFER_TYPE.sender)
    return `Dear ${firstName} you have transferred ${credit} birr to ${secondName}`;
  return `Dear ${secondName}, ${firstName} transferred ${credit} birr to your account`;
};
export const genUserCredit = async () => {
  let users: User[] = await findAllUsersWithoutAdminCredit();
  console.log(users);
  for (let x = 0; x < users.length; x++) {
    let userCredit = await addUserCredit(users[x]);
    await registerCreditForExistingUser(users[x].id, userCredit);
  }
};
export const updateCredit = async (data: TAddCredit) => {
  console.log(data);
  await userCreditRepository
    .createQueryBuilder()
    .update(UserCredit)
    .set({
      credit: data.credit,
      current_credit: data.currentCredit,
      percentage_cut: data.percentageCut,
    })
    .where('id = :id', { id: data.id })
    .execute();
  // await userCreditRepository.update(
  //   {
  //     id: data.id,
  //   },
  //   {
  //     credit: data.credit,
  //     current_credit: data.currentCredit,
  //     percentage_cut: data.percentageCut,
  //   }
  // );
};
