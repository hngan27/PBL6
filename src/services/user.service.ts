import { AppDataSource } from '../config/data-source';
import { User } from '../entity/user.entity';
import { Post } from '../entity/post.entity';
import { Friend } from '../entity/friend.entity';

const userRepository = AppDataSource.getRepository(User);

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
    select: ['id', 'username', 'full_name', 'email', 'avatar_url', 'bio', 'date_of_birth', 'address'], // Chọn các trường cần thiết
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
  return await userRepository.createQueryBuilder('user')
    .where('user.username LIKE :query OR user.email LIKE :query', { query: `%${query}%` })
    .select(['user.id', 'user.username', 'user.full_name', 'user.email', 'user.avatar_url'])
    .getMany();
};