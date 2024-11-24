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
  const friends = await AppDataSource.getRepository(Friend)
    .createQueryBuilder('friend')
    .leftJoinAndSelect('friend.user', 'user') // Join với bảng user của người dùng
    .leftJoinAndSelect('friend.friend', 'friendUser') // Join với bảng user của bạn bè
    .where('(friend.user.id = :userId OR friend.friend.id = :userId)', { userId })
    .andWhere('friend.status = :accepted', { accepted: 'accepted' })
    .getMany();

  const result = friends.map(friend => {
    // Kiểm tra nếu người dùng là người yêu cầu kết bạn (user) hay là người bạn (friend)
    const friendData = friend.user.id === userId ? friend.friend : friend.user;
    
    return {
      id: friendData.id,
      full_name: friendData.full_name,
      username: friendData.username,
      email: friendData.email,
      avatar_url: friendData.avatar_url,
      bio: friendData.bio,
      date_of_birth: friendData.date_of_birth,
      address: friendData.address,
      interestedUser: friendData.interestedUser,
    };
  });

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
      },
    },
  });

  const result = incomingRequests.map(request => ({
    requestId: request.id,
    senderId: request.user.id,
    senderName: request.user.full_name,
    senderAvatar: request.user.avatar_url,
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
      },
    },
  });

  const result = outgoingRequests.map(request => ({
    requestId: request.id,
    recipientId: request.friend.id,
    recipientName: request.friend.full_name,
    recipientAvatar: request.friend.avatar_url,
  }));

  return result;
};

export const cancelFriendRequest = async (userId: string, friendId: string) => {
  // Kiểm tra lời mời kết bạn mà người dùng hiện tại đã gửi đi
  const sentRequest = await friendRepository.findOne({
    where: {
      user: { id: userId },
      friend: { id: friendId },
      status: 'pending',
    },
  });

  if (!sentRequest) {
    throw new Error('Friend request not found or cannot be canceled');
  }

  // Xóa lời mời kết bạn
  await friendRepository.remove(sentRequest);

  return { message: 'Friend request canceled successfully' };
};

export const findPossibleFriends = async (currentUserId: string) => {
  // Lấy danh sách bạn của người dùng hiện tại
  // Lấy danh sách bạn của người dùng hiện tại
  const currentUserFriends = await AppDataSource.getRepository(Friend)
    .createQueryBuilder('friend')
    .leftJoinAndSelect('friend.user', 'user') // Joins the user table
    .leftJoinAndSelect('friend.friend', 'friendUser') // Joins the friend table
    .where('friend.user.id = :userId OR friend.friend.id = :userId', {
      userId: currentUserId,
    })
    .getMany();

  // Lấy danh sách bạn tiềm năng (không phải là bạn hiện tại)
  const potentialFriends = await AppDataSource.getRepository(User)
    .createQueryBuilder('user')
    .where('user.id != :currentUserId', { currentUserId })
    .getMany();

  // Loại bỏ những người đã là bạn bè
  const filteredPotentialFriends = potentialFriends.filter(
    potentialFriend =>
      !currentUserFriends.some(
        friend =>
          friend.friend?.id === potentialFriend.id ||
          friend.user?.id === potentialFriend.id
      )
  );

  // Tính số lượng bạn chung cho từng người bạn tiềm năng
  const userPotentialFriendsWithCommonCount = await Promise.all(
    filteredPotentialFriends.map(async potentialFriend => {
      // Lấy danh sách bạn của người bạn tiềm năng
      const potentialFriendFriends = await AppDataSource.getRepository(Friend)
        .createQueryBuilder('friend')
        .leftJoinAndSelect('friend.user', 'user')
        .leftJoinAndSelect('friend.friend', 'friendUser')
        .where('friend.user.id = :userId OR friend.friend.id = :userId', {
          userId: potentialFriend.id,
        })
        .getMany();

      // Tính số lượng bạn chung
      const commonFriends = currentUserFriends.filter(friend =>
        potentialFriendFriends.some(
          pf =>
            pf.user?.id === friend.friend?.id ||
            pf.friend?.id === friend.friend?.id // Kiểm tra sự tồn tại trước khi truy cập `id`
        )
      );

      return {
        potentialFriend,
        commonFriendsCount: commonFriends.length,
      };
    })
  );

  // Loại bỏ những người không có bạn chung
  const filteredWithCommonFriends = userPotentialFriendsWithCommonCount.filter(
    friendWithCommonCount => friendWithCommonCount.commonFriendsCount > 0
  );

  // Sắp xếp danh sách bạn tiềm năng theo số lượng bạn chung từ cao đến thấp
  filteredWithCommonFriends.sort(
    (a, b) => b.commonFriendsCount - a.commonFriendsCount
  );

  // Giới hạn kết quả lấy 30 người bạn tiềm năng có số lượng bạn chung nhiều nhất
  const topPotentialFriends = filteredWithCommonFriends.slice(0, 30);

  // In ra kết quả
  console.log(topPotentialFriends);

  return topPotentialFriends;
};
