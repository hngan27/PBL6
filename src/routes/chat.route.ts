import express from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import upload from '../config/multer-config';

const router = express.Router();

// API 1: Lấy tất cả các người đã nhắn tin với người dùng, cùng với tin nhắn cuối cùng
router.get('/', authenticateToken, chatController.getAllChats);

// API 2: Lấy tất cả tin nhắn đã nhắn với một người
router.get(
  '/messages/:receiverId',
  authenticateToken,
  chatController.getMessages
);

// API 3: Gửi tin nhắn theo thời gian thực
router.post(
  '/sendMessage',
  authenticateToken,
  upload.single('image'),
  chatController.sendMessage
);

export default router;
