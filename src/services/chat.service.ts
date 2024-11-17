import { AppDataSource } from '../config/data-source';
import { Message } from '../entity/message.entity';
import { User } from '../entity/user.entity';
import { format } from 'date-fns';

// API 1: Lấy tất cả các người đã nhắn tin với người dùng cùng với tin nhắn cuối cùng
export const getAllChats = async (userId: string) => {
  const messages = await AppDataSource.getRepository(Message)
    .createQueryBuilder('message')
    .where('(message.senderId = :userId OR message.receiverId = :userId)', {
      userId,
    })
    .leftJoinAndSelect('message.sender', 'sender')
    .leftJoinAndSelect('message.receiver', 'receiver')
    .orderBy('message.timestamp', 'DESC') // Sắp xếp theo thời gian gửi tin nhắn
    .getMany();

  const chats = messages.reduce((acc: any, message) => {
    const otherUserId =
      message.sender.id === userId ? message.receiver.id : message.sender.id;

    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        userId: otherUserId,
        userName:
          message.sender.id === userId
            ? message.receiver.full_name
            : message.sender.full_name,
        userAvatar:
          message.sender.id === userId
            ? message.receiver.avatar_url
            : message.sender.avatar_url,
        lastMessage:
          message.imageUrl && !message.content
            ? message.sender.id === userId
              ? 'Bạn đã gửi một hình ảnh!'
              : `${message.sender.full_name} đã gửi một hình ảnh cho bạn`
            : message.content,
        timestamp: format(new Date(message.timestamp), 'dd-MM-yyyy HH:mm:ss'),
      };
    }
    return acc;
  }, {});

  return Object.values(chats);
};
// API 2: Lấy tất cả tin nhắn đã nhắn với một người
export const getMessages = async (userId: string, receiverId: string) => {
  // Lấy tất cả tin nhắn giữa userId và receiverId
  const messages = await AppDataSource.getRepository(Message)
    .createQueryBuilder('message')
    .leftJoinAndSelect('message.sender', 'sender') // Liên kết với thông tin người gửi
    .leftJoinAndSelect('message.receiver', 'receiver') // Liên kết với thông tin người nhận
    .where(
      '(message.senderId = :userId AND message.receiverId = :receiverId) OR (message.senderId = :receiverId AND message.receiverId = :userId)',
      { userId, receiverId }
    )
    .orderBy('message.timestamp', 'ASC') // Sắp xếp theo thời gian tăng dần
    .getMany();

  // Lấy thông tin người gửi và người nhận
  const sender = await AppDataSource.getRepository(User).findOneBy({
    id: userId,
  });
  const receiver = await AppDataSource.getRepository(User).findOneBy({
    id: receiverId,
  });

  if (!sender || !receiver) {
    throw new Error('Sender or receiver not found');
  }

  // Tách tin nhắn thành hai nhóm: gửi đi (right) và nhận được (left)
  const allMessages = {
    right: {
      id: sender.id,
      name: sender.full_name,
      messages: messages
        .filter(message => message.sender.id === userId)
        .map(message => ({
          content: message.content,
          timestamp: format(new Date(message.timestamp), 'dd-MM-yyyy HH:mm:ss'), // Định dạng thời gian
          sender: 'user', // Đánh dấu người gửi là 'user'
          imageUrl: message.imageUrl || '', // Nếu không có ảnh thì để trống
        })),
    },
    left: {
      id: receiver.id,
      name: receiver.full_name,
      messages: messages
        .filter(message => message.sender.id === receiverId)
        .map(message => ({
          content: message.content,
          timestamp: format(new Date(message.timestamp), 'dd-MM-yyyy HH:mm:ss'), // Định dạng thời gian
          sender: 'opponent', // Đánh dấu người gửi là 'opponent'
          imageUrl: message.imageUrl || '', // Nếu không có ảnh thì để trống
        })),
    },
  };

  return { all_message: allMessages };
};

// API 3: Gửi tin nhắn
export const sendMessage = async (
  senderId: string, // Tham số senderId
  receiverId: string, // Tham số receiverId
  content: string, // Tham số content
  imageUrl: string
): Promise<Message> => {
  // Kiểm tra tham số
  if (typeof senderId !== 'string' || typeof receiverId !== 'string') {
    throw new Error('Invalid data types');
  }

  const sender = await AppDataSource.getRepository(User).findOne({
    where: { id: senderId },
  });
  const receiver = await AppDataSource.getRepository(User).findOne({
    where: { id: receiverId },
  });

  if (!sender || !receiver) {
    throw new Error('Sender or receiver not found');
  }

  const newMessage = new Message();
  newMessage.sender = sender;
  newMessage.receiver = receiver;
  newMessage.content = content;
  newMessage.timestamp = new Date();
  newMessage.imageUrl = imageUrl;

  const savedMessage =
    await AppDataSource.getRepository(Message).save(newMessage);
  return savedMessage;
};
