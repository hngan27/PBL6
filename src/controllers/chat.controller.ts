import { Request, Response } from 'express';
import { getReceiverSocketId, io } from "../config/socket";
import {
  getAllChats as getAllChatsService,
  getMessages as getMessagesService,
  sendMessage as sendMessageService,
} from '../services/chat.service';
// import { io } from '../config/socket'
import uploadImageToCloudinary from '../utils/cloudinaryUpload';

// API 1: Lấy tất cả các người đã nhắn tin cùng với tin nhắn cuối cùng
export const getAllChats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id; // Lấy userId từ thông tin người dùng trong req.user

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Gọi service để lấy tất cả các cuộc trò chuyện của người dùng
    const chats = await getAllChatsService(userId);

    return res.status(200).json(chats);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// API 2: Lấy tất cả tin nhắn đã nhắn với một người
export const getMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?.id; // Lấy userId từ thông tin người dùng trong req.user
    const receiverId = req.params.receiverId;

    if (!userId || !receiverId) {
      return res
        .status(400)
        .json({ message: 'User ID and Receiver ID are required' });
    }

    // Gọi service để lấy tất cả tin nhắn giữa người dùng và người nhận
    const messages = await getMessagesService(userId, receiverId);

    return res.status(200).json(messages);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// API 3: Gửi tin nhắn theo thời gian thực
export const sendMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const senderId = req.user?.id;
    const { receiverId, content }: { receiverId: string; content: string } =
      req.body;
    const file = req.file;

    let imageUrl: string | null = null;

    // Xử lý tải lên ảnh nếu có
    if (file) {
      const result = await uploadImageToCloudinary(file);
      imageUrl = result.secure_url;
    }

    // Kiểm tra xem senderId có hợp lệ không
    if (!senderId || typeof senderId !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid senderId format' });
    }

    // Kiểm tra receiverId
    if (!receiverId || typeof receiverId !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid receiverId format' });
    }

    // Gọi service để gửi tin nhắn
    const savedMessage = await sendMessageService(
      senderId,
      receiverId,
      content ?? '',
      imageUrl ?? ''
    );



    console.log(
      `Message sent from ${senderId} to ${receiverId}: ${content} and ${imageUrl}`
    );

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", savedMessage);
    }


    // Trả về tin nhắn đã gửi
    return res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: savedMessage,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred',
      error: error.message,
    });
  }
};
