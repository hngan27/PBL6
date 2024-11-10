// src/controllers/commentController.ts
import { Request, Response } from 'express';
import {
  addComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
} from '../services/comment.service';
import uploadImageToCloudinary from '../utils/cloudinaryUpload';

// Lấy danh sách bình luận theo bài viết
export const getComments = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const comments = await getCommentsByPost(postId);
    res.status(200).json(comments); // Trả về danh sách bình luận
  } catch (error) {
    handleError(res, error); // Sử dụng hàm handleError để xử lý lỗi
  }
};

// Tạo bình luận mới
export const createComment = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId, content, parentCommentId } = req.body;
  const imageFile = req.file;

  try {
    let image_url: string | null = null; // Khởi tạo image_url là null

    // Xử lý tải lên ảnh nếu có
    if (imageFile) {
      const result = await uploadImageToCloudinary(imageFile); // Sử dụng hàm upload ảnh
      image_url = result.secure_url; // Lưu URL của ảnh
    }

    // Thêm bình luận vào cơ sở dữ liệu
    const comment = await addComment(
      postId,
      userId,
      content,
      image_url,
      parentCommentId
    );

    // Trả về bình luận vừa được tạo
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error); // Log lỗi để theo dõi
    handleError(res, error); // Xử lý lỗi
  }
};

export const editComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const imageFile = req.file;

  try {
    // Khởi tạo biến image_url
    let image_url: string | null = null;

    // Xử lý tải lên ảnh nếu có
    if (imageFile) {
      try {
        const result = await uploadImageToCloudinary(imageFile); // Sử dụng hàm upload ảnh
        image_url = result.secure_url; // Lưu URL của ảnh đã tải lên
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        return res.status(500).json({ message: 'Error uploading image' });
      }
    }

    // Cập nhật bình luận
    const updatedComment = await updateComment(commentId, content, image_url);
    res.status(200).json(updatedComment); // Trả về bình luận đã được chỉnh sửa
  } catch (error) {
    console.error('Error updating comment:', error); // Log lỗi để theo dõi
    handleError(res, error); // Sử dụng hàm handleError để xử lý lỗi
  }
};

// Xóa bình luận
export const removeComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    const response = await deleteComment(commentId);
    res.status(200).json(response); // Trả về phản hồi sau khi xóa
  } catch (error) {
    handleError(res, error); // Sử dụng hàm handleError để xử lý lỗi
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
