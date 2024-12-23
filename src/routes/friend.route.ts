// src/routes/friend.route.ts
import { Router } from 'express';
import * as friendController from '../controllers/friend.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Middleware xác thực token

const router = Router();

router.post('/request', authenticateToken, friendController.requestFriend); // Gửi yêu cầu kết bạn
router.post(
  '/accept/:requestId',
  authenticateToken,
  friendController.acceptRequest
); // Chấp nhận yêu cầu kết bạn
router.get('/list/:userId', authenticateToken, friendController.listFriends); // Danh sách bạn bè
router.post(
  '/reject/:requestId',
  authenticateToken,
  friendController.rejectRequest
); // Từ chối yêu cầu kết bạn
router.get(
  '/requests/incoming',
  authenticateToken,
  friendController.fetchIncomingRequests
); // Trả về danh sách yêu cầu đến người dùng hiện tại
router.get(
  '/requests/outgoing',
  authenticateToken,
  friendController.fetchOutgoingRequests
); // Trả về danh sách yêu cầu từ người dùng hiện tại

router.delete(
  '/cancel/:friendId',
  authenticateToken,
  friendController.cancelFriendRequestController
);

router.get(
  '/possible-friends',
  authenticateToken,
  friendController.getPossibleFriendsController
); // trả về danh sách gợi ý kết bạn

router.post('/unfriend',authenticateToken, friendController.handleUnfriendRequest);

export default router;
