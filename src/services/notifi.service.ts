import { AppDataSource } from '../config/data-source';
import { Notification } from '../entity/notification.entity';

const notificationRepository = AppDataSource.getRepository(Notification);

// Lấy danh sách thông báo
export const getNotifications = async (userId: string) => {
  return await notificationRepository.find({
    where: { receiver: { id: userId } },
    relations: ['sender'], // Nếu cần thông tin người gửi
    order: { created_at: 'DESC' },
  });
};

// Đánh dấu một thông báo là đã đọc
export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await notificationRepository.findOne({
    where: { id: notificationId, receiver: { id: userId } },
  });

  if (!notification) {
    throw new Error('Notification not found or not authorized');
  }

  notification.is_read = true;
  await notificationRepository.save(notification);
  return notification;
};

// Đánh dấu tất cả thông báo là đã đọc
export const markAllAsRead = async (userId: string) => {
  const notifications = await notificationRepository.find({
    where: { receiver: { id: userId }, is_read: false },
  });

  notifications.forEach((notification) => {
    notification.is_read = true;
  });

  await notificationRepository.save(notifications);
  return notifications;
};
