import { AppDataSource } from '../config/data-source';
import { Friend } from '../entity/friend.entity';
import { Post } from '../entity/post.entity';
import { AccessModifier } from '../enums/accessModifier.enum';

export const getUserFeed = async (userId: string) => {
  // Lấy danh sách bạn bè của người dùng
  const friends = await AppDataSource.getRepository(Friend)
    .createQueryBuilder('friend')
    .leftJoinAndSelect('friend.user', 'user') // Lấy thông tin người dùng
    .leftJoinAndSelect('friend.friend', 'friendUser') // Lấy thông tin bạn bè
    .where('(friend.user.id = :userId OR friend.friend.id = :userId)', {
      userId,
    }) // Lọc theo userId hoặc friendId
    .andWhere('friend.status = :accepted', { accepted: 'accepted' }) // Lọc các mối quan hệ đã chấp nhận
    .getMany();

  // Lấy danh sách các friendIds
  const friendIds = friends.map(friend => {
    return friend.user.id === userId ? friend.friend.id : friend.user.id;
  });

  // Truy vấn các bài viết của bạn bè và các bài viết public của người dùng khác
  const posts = await AppDataSource.getRepository(Post)
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user') // Lấy thông tin người đăng bài
    .where(
      '(post.userId IN (:...friendIds) AND (post.access_modifier = :friend OR post.access_modifier = :public))',
      {
        friendIds,
        friend: AccessModifier.Friend,
        public: AccessModifier.Public,
      }
    )
    .orderBy('post.created_at', 'DESC') // Sắp xếp theo thời gian giảm dần
    .getMany();

  return posts;
};
