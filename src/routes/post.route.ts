// src/routes/post.routes.ts
import express from 'express';
import {
    getAllPostsByUserId,
  createPost,
  editPost,
  removePost,
} from '../controllers/post.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import upload from '../config/multer-config';

const router = express.Router();

router.get('/:userId/posts', authenticateToken, getAllPostsByUserId); // Lấy bài viết của bạn bè
router.post('/posts', authenticateToken, upload.single('image'), createPost); // Tạo bài viết mới
router.put('/posts/:postId', authenticateToken, upload.single('image'), editPost); // Chỉnh sửa bài viết
router.delete('/posts/:postId', authenticateToken, removePost); // Xóa bài viết

export default router;
