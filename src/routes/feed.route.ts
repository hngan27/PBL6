// src/routes/feed.routes.ts
import { Router } from 'express';
import { getUserFeedController } from '../controllers/feed.controller';
import { authenticateToken } from '../middleware/auth.middleware'; 

const router = Router();

router.get('/feed',authenticateToken, getUserFeedController);

export default router;
