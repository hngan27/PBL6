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

  // Kiểm tra nếu friendIds rỗng
  if (friendIds.length === 0) {
    // Nếu friendIds rỗng, trả về mảng rỗng và ngừng xử lý
    return [];
  }

  // Truy vấn các bài viết của chính người dùng
  const userPosts = await AppDataSource.getRepository(Post)
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user') // Lấy thông tin người đăng bài
    .leftJoinAndSelect('post.comments', 'comments') // Lấy liên kết với comments
    .leftJoinAndSelect('comments.user', 'commentUser') // Lấy user của comment
    .leftJoinAndSelect('post.likes', 'likes') // Lấy liên kết với likes
    .leftJoinAndSelect('likes.user', 'likeUser') // Lấy user của like
    .where('post.userId = :userId', { userId }) // Lọc các bài viết của chính người dùng
    .orderBy('post.created_at', 'DESC') // Sắp xếp theo thời gian giảm dần
    .getMany();

  // Truy vấn các bài viết của bạn bè và các bài viết public của người dùng khác
  const friendPosts = await AppDataSource.getRepository(Post)
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user') // Lấy thông tin người đăng bài
    .leftJoinAndSelect('post.comments', 'comments') // Lấy liên kết với comments
    .leftJoinAndSelect('comments.user', 'commentUser') // Lấy user của comment
    .leftJoinAndSelect('post.likes', 'likes') // Lấy liên kết với likes
    .leftJoinAndSelect('likes.user', 'likeUser') // Lấy user của like
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

  // Kết hợp các bài viết của người dùng và bạn bè
  const allPosts = [...userPosts, ...friendPosts];

  const formattedPosts = allPosts.map(post => ({
    post_id: post.post_id,
    content: post.content,
    access_modifier: post.access_modifier,
    like_count: post.like_count,
    comment_count: post.comment_count,
    image_url: post.image_url,
    created_at: post.created_at,
    updated_at: post.updated_at,
    user: {
      id: post.user.id,
      username: post.user.username,
      password: post.user.password,
      full_name: post.user.full_name,
      email: post.user.email,
      avatar_url: post.user.avatar_url,
      interestedUser: post.user.interestedUser,
      bio: post.user.bio,
      date_of_birth: post.user.date_of_birth,
      address: post.user.address,
    },
    comments:
      post.comments?.map(comment => ({
        comment_id: comment.comment_id,
        content: comment.content,
        image_url: comment.image_url,
        created_at: comment.created_at,
        user: {
          id: comment.user?.id,
          username: comment.user?.username,
          full_name: comment.user?.full_name,
          avatar_url: comment.user?.avatar_url,
        },
        replies:
          comment.replies?.map(reply => ({
            comment_id: reply.comment_id,
            content: reply.content,
            created_at: reply.created_at,
            user: {
              id: reply.user?.id,
              username: reply.user?.username,
              full_name: comment.user?.full_name,
              avatar_url: reply.user?.avatar_url,
            },
          })) || [],
      })) || [],
    likes:
      post.likes?.map(like => ({
        like_id: like.like_id,
        user: {
          id: like.user?.id,
          full_name: like.user?.full_name,
          username: like.user?.username,
          avatar_url: like.user?.avatar_url,
        },
      })) || [],
  }));

  return formattedPosts;
};
