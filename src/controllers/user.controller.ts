import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import * as historyService from '../services/history.service';
import uploadImageToCloudinary from '../utils/cloudinaryUpload';

export const fetchAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Hiển thị thông tin người dùng
export const fetchUserProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Sử dụng optional chaining

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user found' });
  }

  try {
    const userProfile = await userService.getUserProfile(userId);
    res.status(200).json(userProfile);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export const editProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Lấy userId từ token hoặc session
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user found' });
  }

  const { full_name, bio, date_of_birth, address } = req.body;

  // Nếu có avatar mới thì lấy từ req.file
  const avatarFile = req.file;
  let avatar_url: string | undefined;

  try {
    // Nếu có ảnh avatar mới, tải lên Cloudinary từ bộ nhớ
    if (avatarFile) {
      const result = await uploadImageToCloudinary(avatarFile);
      avatar_url = result.secure_url; // Lấy URL ảnh sau khi upload lên Cloudinary
      console.log('Uploaded avatar URL:', avatar_url); // Kiểm tra URL ảnh đã upload
    }

    // Cập nhật thông tin người dùng
    const result = await userService.updateUserProfile(userId, {
      full_name,
      avatar_url, 
      bio,
      date_of_birth,
      address,
    });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
// Lưu lịch sử tìm kiếm
export const searchUsers = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Lấy userId từ token hoặc session
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Lưu lịch sử tìm kiếm
    if (userId) {
      await historyService.saveSearchHistory(userId, query as string);
    }

    const users = await userService.searchUsers(query as string);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error });
  }
};

// Lấy lịch sử tìm kiếm của người dùng
export const fetchSearchHistory = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user found' });
  }

  try {
    const history = await historyService.getSearchHistoryByUserId(userId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching search history', error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  const currentUserId = req.user?.id; 
  const { targetUserId } = req.params;

  if (!currentUserId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const profile = await userService.getProfileWithDetails(currentUserId, targetUserId);
    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};
