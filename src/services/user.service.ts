import { AppDataSource } from '../config/data-source';
import { User } from '../entity/user.entity';
import { Post } from '../entity/post.entity';
import { Friend } from '../entity/friend.entity';
import { AccessModifier } from '../enums/accessModifier.enum';
import { In } from 'typeorm';

const userRepository = AppDataSource.getRepository(User);
const friendRepository = AppDataSource.getRepository(Friend);
const postRepository = AppDataSource.getRepository(Post);

export const getUserById = async (userId: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const getAllUsers = async () => {
  return await userRepository.find({
    select: ['id', 'full_name', 'email', 'avatar_url'],
  });
};

// Lấy thông tin người dùng cùng với số bài đăng, số bạn bè
export const getUserProfile = async (userId: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ['posts', 'friends'], // Lấy bài đăng và bạn bè
    select: [
      'id',
      'username',
      'full_name',
      'email',
      'avatar_url',
      'bio',
      'date_of_birth',
      'address',
    ], // Chọn các trường cần thiết
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Tính tổng số bài đăng
  const postCount = user.posts.length;

  // Tính tổng số bạn bè
  const friendCount = user.friends.length;

  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    avatar_url: user.avatar_url,
    postCount,
    friendCount,
    bio: user.bio,
    date_of_birth: user.date_of_birth,
    address: user.address,
  };
};

export const updateUserProfile = async (
  userId: string,
  userData: Partial<User>
) => {
  const user = await userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Cập nhật thông tin người dùng
  user.full_name = userData.full_name || user.full_name;
  user.avatar_url = userData.avatar_url || user.avatar_url;
  user.bio = userData.bio || user.bio;
  user.date_of_birth = userData.date_of_birth || user.date_of_birth;
  user.address = userData.address || user.address;

  await userRepository.save(user);

  return {
    message: 'Profile updated successfully',
    user,
  };
};

export const searchUsers = async (query: string) => {
  // Tìm kiếm người dùng theo username hoặc email
  return await userRepository
    .createQueryBuilder('user')
    .where('user.username LIKE :query OR user.email LIKE :query', {
      query: `%${query}%`,
    })
    .select([
      'user.id',
      'user.username',
      'user.full_name',
      'user.email',
      'user.avatar_url',
    ])
    .getMany();
};

export const getProfileWithDetails = async (
  currentUserId: string,
  targetUserId: string
) => {
  // Lấy thông tin người dùng
  const targetUser = await userRepository.findOne({
    where: { id: targetUserId },
    select: [
      'id',
      'full_name',
      'username',
      'email',
      'avatar_url',
      'bio',
      'date_of_birth',
      'address',
    ],
  });

  if (!targetUser) {
    throw new Error('User not found');
  }

  // Kiểm tra nếu là chính mình
  const isSelf = currentUserId === targetUserId;

  // Tạo điều kiện `access_modifier` cho bài viết
  let accessModifiers: AccessModifier[] = [AccessModifier.Public];
  if (isSelf) {
    // Nếu là chính mình, lấy tất cả bài viết (bao gồm Public, Friend, Private)
    accessModifiers = [
      AccessModifier.Public,
      AccessModifier.Friend,
      AccessModifier.Private,
    ];
  } else {
    // Kiểm tra mối quan hệ bạn bè
    const isFriend = await friendRepository.findOne({
      where: [
        {
          user: { id: currentUserId },
          friend: { id: targetUserId },
          status: 'accepted',
        },
        {
          user: { id: targetUserId },
          friend: { id: currentUserId },
          status: 'accepted',
        },
      ],
    });

    if (isFriend) {
      // Nếu là bạn bè, lấy bài viết Public và Friend
      accessModifiers.push(AccessModifier.Friend);
    }
  }

  // Lấy bài viết với điều kiện đã xác định
  const posts = await postRepository.find({
    where: {
      user: { id: targetUserId },
      access_modifier: In(accessModifiers), // Sử dụng In để kiểm tra nhiều access_modifier
    },
    relations: ['user'], // Liên kết với thông tin người dùng
    order: { created_at: 'DESC' }, // Sắp xếp theo thời gian
  });

  const friendCount = await friendRepository.count({
    where: [
      { user: { id: targetUserId }, status: 'accepted' },
      { friend: { id: targetUserId }, status: 'accepted' },
    ],
  });

  return {
    user: {
      ...targetUser,
      friendCount,
    },
    posts,
  };
};
