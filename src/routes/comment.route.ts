import express from 'express';
import {
  createComment,
  getComments,
  removeComment,
  editComment,
} from '../controllers/comment.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import upload from '../config/multer-config';

const router = express.Router();

router.post(
  '/:postId/comments',
  authenticateToken,
  upload.single('avatar'),
  createComment
);
router.get('/:postId/comments', authenticateToken, getComments);
router.delete('/comments/:commentId', authenticateToken, removeComment);
router.put(
  '/comments/:commentId',
  authenticateToken,
  upload.single('avatar'),
  editComment
);

export default router;
