// src/controllers/like.controller.ts
import { Request, Response } from 'express';
import { toggleLikePost, getUsersWhoLikedPost } from '../services/like.service';

export const likePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  try {
    const likeCount = await toggleLikePost(postId, userId);
    res.status(200).json({ message: 'Success', like_count: likeCount });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Hàm xử lý để lấy danh sách người dùng đã thích bài viết
export const handleGetUsersWhoLikedPost = async (
  req: Request,
  res: Response
) => {
  const postId = req.params.postId;

  try {
    const users = await getUsersWhoLikedPost(postId);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No likes found for this post.' });
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users who liked the post:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
