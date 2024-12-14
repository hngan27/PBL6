import { Request, Response } from 'express';
import * as notificationService from '../services/notifi.service';

// Lấy danh sách thông báo
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const notifications = await notificationService.getNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    const err = error as Error;
    console.error(err.message);
  }
};

// Đánh dấu một thông báo là đã đọc
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(
      notificationId,
      userId
    );
    res.status(200).json(notification);
  } catch (error) {
    const err = error as Error;
    console.error(err.message);
  }
};

// Đánh dấu tất cả thông báo là đã đọc
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const notifications = await notificationService.markAllAsRead(userId);
    res.status(200).json(notifications);
  } catch (error) {
    const err = error as Error;
    console.error(err.message);
  }
};
