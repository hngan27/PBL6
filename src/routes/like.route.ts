// src/routes/index.ts
import { Router } from 'express';
import * as likeController from '../controllers/like.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/:postId/like', authenticateToken, likeController.likePost);
router.get('/:postId/likes', likeController.handleGetUsersWhoLikedPost);

export default router;
