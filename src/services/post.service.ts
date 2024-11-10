// src/services/post.service.ts
import { AppDataSource } from '../config/data-source';
import { Post } from '../entity/post.entity';
import { User } from '../entity/user.entity';
import { Comment } from '../entity/comment.entity';
import { Like } from '../entity/like.entity';
import { AccessModifier } from '../enums/accessModifier.enum';

const postRepository = AppDataSource.getRepository(Post);
const userRepository = AppDataSource.getRepository(User);

export const getPostsByUserId = async (userId: string) => {
  // Lấy tất cả bài viết của người dùng theo userId
  return await postRepository.find({
    where: { user: { id: userId } }, // Đảm bảo ánh xạ đúng với User
    relations: ['user', 'comments', 'likes'], // Liên kết với các thực thể khác nếu cần
    order: { created_at: 'DESC' }, // Sắp xếp theo thời gian tạo giảm dần
  });
};

export const addPost = async (
  userId: string,
  content: string,
  accessModifier: AccessModifier,
  imageUrl: string | null
) => {
  // Tìm người dùng theo userId
  const user = await userRepository.findOneBy({ id: userId });

  // Kiểm tra nếu user không tồn tại
  if (!user) {
    throw new Error('User not found'); // Hoặc xử lý theo cách khác
  }

  const post = new Post();
  post.user = user;
  post.content = content;
  post.access_modifier = accessModifier;
  post.image_url = imageUrl;

  return await postRepository.save(post);
};

export const updatePost = async (
  postId: string,
  content: string,
  accessModifier: AccessModifier,
  imageUrl: string | null
) => {
  const post = await postRepository.findOneBy({ post_id: postId });
  if (!post) throw new Error('Post not found');

  post.content = content;
  post.access_modifier = accessModifier;
  post.image_url = imageUrl;

  return await postRepository.save(post);
};

export const deletePost = async (postId: string) => {
  // Xóa bài viết theo ID
  const result = await postRepository.delete(postId);

  // Kiểm tra xem có bài viết nào bị xóa không
  if (result.affected === 0) {
    throw new Error('No post found to delete'); // Hoặc xử lý theo cách khác
  }

  return { message: 'Post deleted successfully' };
};
