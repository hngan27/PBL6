import { Router } from 'express';
import * as notificationController from '../controllers/notifi.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Lấy danh sách thông báo
router.get('/', authenticateToken, notificationController.getNotifications);

// Đánh dấu một thông báo là đã đọc
router.patch(
  '/:notificationId/read',
  authenticateToken,
  notificationController.markAsRead
);

// Đánh dấu tất cả thông báo là đã đọc
router.patch(
  '/read-all',
  authenticateToken,
  notificationController.markAllAsRead
);

export default router;
