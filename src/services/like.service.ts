// src/services/like.service.ts
import { AppDataSource } from '../config/data-source';
import { Post } from '../entity/post.entity';
import { Like } from '../entity/like.entity';
import { User } from '../entity/user.entity';

export const toggleLikePost = async (postId: string, userId: string) => {
  const postRepository = AppDataSource.getRepository(Post);
  const likeRepository = AppDataSource.getRepository(Like);
  const userRepository = AppDataSource.getRepository(User);

  const post = await postRepository.findOne({ where: { post_id: postId } });
  const user = await userRepository.findOne({ where: { id: userId } });

  if (!post || !user) {
    throw new Error('Post or User not found');
  }

  // Kiểm tra xem người dùng đã thích bài viết chưa
  let like = await likeRepository.findOne({
    where: { post: post, user: user },
  });

  if (like) {
    // Nếu đã thích, thì hủy thích
    await likeRepository.remove(like);
    post.like_count -= 1;
  } else {
    // Nếu chưa thích, thêm mới
    like = new Like();
    like.post = post;
    like.user = user;
    await likeRepository.save(like);
    post.like_count += 1;
  }

  // Cập nhật số lượng lượt thích trong bài viết
  await postRepository.save(post);

  return post.like_count;
};

// Hàm để lấy danh sách người dùng đã thích bài viết
export const getUsersWhoLikedPost = async (postId: string) => {
  const likeRepository = AppDataSource.getRepository(Like);

  // Tìm tất cả lượt thích cho bài viết cụ thể
  const likes = await likeRepository.find({
    where: { post: { post_id: postId } },
    relations: ['user'], // Lấy thông tin người dùng đã thích
  });

  return likes.map(like => ({
    id: like.user.id,
    username: like.user.username,
    email: like.user.email,
  }));
};
