// src/controllers/post.controller.ts
import { Request, Response } from 'express';
import {
  addPost,
  getPostsByUserId,
  updatePost,
  deletePost,
} from '../services/post.service';
import fs from 'fs';
import cloudinary from '../config/cloudinary.config';
import { getUserById } from '../services/user.service';

export const getAllPostsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params; // Lấy userId từ params

  try {
    const posts = await getPostsByUserId(userId); // Gọi dịch vụ để lấy bài viết
    res.status(200).json(posts); // Trả về danh sách bài viết
  } catch (error) {
    console.error('Error fetching posts:', error); // Log lỗi
    handleError(res, error); // Xử lý lỗi
  }
};

// Đăng bài viết mới
export const createPost = async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const userId = req.user.id;
  const { content, accessModifier } = req.body;
  const imageFile = req.file;

  try {
    let image_url: string | null = null;

    if (imageFile) {
      // Tải ảnh lên Cloudinary
      const result = await cloudinary.v2.uploader.upload(imageFile.path);
      image_url = result.secure_url;
      fs.unlinkSync(imageFile.path);
    }

    const user = await getUserById(userId);

    const post = await addPost(userId, content, accessModifier, image_url);
    res.status(201).json({
      ...post,
      user: { full_name: user.full_name, avatar_url: user.avatar_url }, 
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Chỉnh sửa bài viết
export const editPost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content, accessModifier } = req.body;
  const imageFile = req.file;

  try {
    let image_url: string | null = null;

    if (imageFile) {
      const result = await cloudinary.v2.uploader.upload(imageFile.path);
      image_url = result.secure_url;
      fs.unlinkSync(imageFile.path);
    }

    const updatedPost = await updatePost(
      postId,
      content,
      accessModifier,
      image_url
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    handleError(res, error);
  }
};

// Xóa bài viết
export const removePost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const response = await deletePost(postId);
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error);
  }
};

// Hàm xử lý lỗi
const handleError = (res: Response, error: unknown) => {
  if (error instanceof Error) {
    res.status(400).json({ message: error.message }); // Nếu là lỗi kiểu Error
  } else {
    res.status(400).json({ message: 'An unknown error occurred.' }); // Lỗi không xác định
  }
};
