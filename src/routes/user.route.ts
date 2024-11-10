import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import upload from '../config/multer-config';

const router = Router();

router.get('/users', userController.fetchAllUsers);
router.get('/user/profile', authenticateToken, userController.fetchUserProfile);
router.put(
  '/user/profile',
  authenticateToken,
  upload.single('image'),
  userController.editProfile
);
router.post('/user/search', authenticateToken, userController.searchUsers);
router.get(
  '/user/search/history',
  authenticateToken,
  userController.fetchSearchHistory
);

export default router;
