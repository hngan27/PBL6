import { Request, Response } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  getFriendsList,
  rejectFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
} from '../services/friend.service';

export const requestFriend = async (req: Request, res: Response) => {
  const { friendId } = req.body;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const friendRequest = await sendFriendRequest(userId, friendId);
    res.status(201).json(friendRequest);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export const acceptRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;

  try {
    const acceptedRequest = await acceptFriendRequest(requestId);
    res.status(200).json(acceptedRequest);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export const listFriends = async (req: Request, res: Response) => {
  // Kiểm tra xem req.user có tồn tại không
  const userId = req.user?.id; // Sử dụng userId từ token
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' }); // Trả về lỗi nếu không có userId
  }

  try {
    const friends = await getFriendsList(userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;

  try {
    const rejectedRequest = await rejectFriendRequest(requestId);
    res.status(200).json(rejectedRequest);
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

export const fetchIncomingRequests = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Lấy userId từ request
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const requests = await getIncomingRequests(userId);
    res.status(200).json(requests);
  } catch (error) {
    // Chuyển đổi kiểu dữ liệu error
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};

export const fetchOutgoingRequests = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Lấy userId từ request
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const requests = await getOutgoingRequests(userId);
    res.status(200).json(requests);
  } catch (error) {
    const errorMessage =
      (error as Error).message || 'An unknown error occurred';
    res.status(500).json({ message: errorMessage });
  }
};
