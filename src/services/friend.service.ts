import { AppDataSource } from '../config/data-source';
import { Friend } from '../entity/friend.entity';
import { User } from '../entity/user.entity';

const friendRepository = AppDataSource.getRepository(Friend);

export const sendFriendRequest = async (userId: string, friendId: string) => {
  // Kiểm tra xem yêu cầu đã tồn tại chưa
  const existingRequest = await friendRepository.findOne({
    where: [{ user: { id: userId }, friend: { id: friendId } }],
  });

  if (existingRequest) {
    throw new Error('Friend request already sent');
  }

  const friendRequest = new Friend();
  friendRequest.user = { id: userId } as User;
  friendRequest.friend = { id: friendId } as User;
  friendRequest.status = 'pending';

  await friendRepository.save(friendRequest);
  return friendRequest;
};

export const acceptFriendRequest = async (requestId: string) => {
  const friendRequest = await friendRepository.findOneBy({ id: requestId });

  if (!friendRequest) {
    throw new Error('Friend request not found');
  }

  friendRequest.status = 'accepted';
  friendRequest.accepted_at = new Date();

  await friendRepository.save(friendRequest);
  return friendRequest;
};

export const getFriendsList = async (userId: string) => {
  const friends = await friendRepository.find({
    where: [
      { user: { id: userId }, status: 'accepted' },
      { friend: { id: userId }, status: 'accepted' },
    ],
    relations: ['friend'],
    select: {
      friend: {
        id: true,
        full_name: true,
        avatar_url: true,
      },
    },
  });

  const result = friends.map(friend => ({
    friendId: friend.friend.id,
    friendName: friend.friend.full_name,
    friendAvatar: friend.friend.avatar_url,
  }));

  return result; 
};

export const rejectFriendRequest = async (requestId: string) => {
  const friendRequest = await friendRepository.findOneBy({ id: requestId });

  if (!friendRequest) {
    throw new Error('Friend request not found');
  }

  friendRequest.status = 'rejected';

  await friendRepository.save(friendRequest);
  return friendRequest;
};

// Lấy Yêu Cầu Kết Bạn Đến Người Dùng Hiện Tại
export const getIncomingRequests = async (userId: string) => {
  const incomingRequests = await friendRepository.find({
    where: { friend: { id: userId }, status: 'pending' },
    relations: ['user'],
    select: {
      id: true, 
      user: {
        id: true,
        full_name: true,
        avatar_url: true,
      }
    }
  });

  const result = incomingRequests.map(request => ({
    requestId: request.id, 
    senderId: request.user.id, 
    senderName: request.user.full_name,
    senderAvatar: request.user.avatar_url
  }));

  return result; 
};

// Lấy Yêu Cầu Kết Bạn Từ Người Dùng Hiện Tại
export const getOutgoingRequests = async (userId: string) => {
  const outgoingRequests = await friendRepository.find({
    where: { user: { id: userId }, status: 'pending' },
    relations: ['friend'],
    select: {
      id: true, 
      friend: {
        id: true, 
        full_name: true,
        avatar_url: true,
      }
    }
  });

  const result = outgoingRequests.map(request => ({
    requestId: request.id, 
    recipientId: request.friend.id, 
    recipientName: request.friend.full_name,
    recipientAvatar: request.friend.avatar_url
  }));

  return result; 
};
