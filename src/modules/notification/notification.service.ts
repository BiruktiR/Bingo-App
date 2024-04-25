import { AppDataSource } from '../../db/data-source';
import { Notification } from '../../db/entities/notification.entity';
import { TFindNotificationSchema } from './notification.schema';
import { generateMetadata } from '../../config/util-functions/generate-metadata';
import { MetadataType } from '../../config/other-types/metadata';
import {
  getMomentFrom,
  getUTCString,
} from '../../config/util-functions/util-functions';
import { Moment } from 'moment-timezone';

const notificationRepository = AppDataSource.getRepository(Notification);

export const findNotification = async (
  filters: TFindNotificationSchema,
  userID: string
) => {
  let notification = await notificationRepository
    .createQueryBuilder('notifications')
    .leftJoinAndSelect('notifications.user', 'user')
    .where('user.id=:userID', { userID: userID });
  if (filters?.id)
    notification.andWhere('notifications.id=:notificationID', {
      notificationID: filters.id,
    });
  if (filters?.type)
    notification.andWhere('notifications.type=:notificationType', {
      notificationType: filters.type,
    });
  if (filters?.start_date)
    notification.andWhere('notifications.date >= :startDate', {
      startDate: filters.start_date,
    });
  if (filters?.end_date)
    notification.andWhere('notifications.date <= :endDate', {
      endDate: filters.end_date,
    });
  notification.orderBy('notifications.date', 'DESC');
  let page: number = !Number.isNaN(parseInt(filters.page))
    ? parseInt(filters.page)
    : 1;
  let limit: number = !Number.isNaN(parseInt(filters.limit))
    ? parseInt(filters.limit)
    : 51;
  let offset: number = limit * (page - 1);

  await notification.skip(offset).take(limit);
  let count: number = await notification.getCount();
  let now: Moment = getUTCString();

  const metadata: MetadataType = await generateMetadata(page, limit, count);
  return {
    metadata: metadata,
    data: (await notification.getMany()).map((x) => {
      return {
        id: x.id,
        date: getMomentFrom(x.date, now),
        notification: x.notification,
        type: x.type,
        user: x.user,
      };
    }),
  };
};
