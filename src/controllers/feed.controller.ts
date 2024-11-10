// src/controllers/feed.controller.ts
import { Request, Response } from 'express';
import { getUserFeed } from '../services/feed.service';

export const getUserFeedController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const posts = await getUserFeed(userId);
    return res.status(200).json({ posts });
  } catch (error) {
    console.error(error);

    // Kiểm tra kiểu của error trước khi truy cập vào thuộc tính message
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';

    return res.status(500).json({
      message: 'Internal server error',
      error: errorMessage,
    });
  }
};