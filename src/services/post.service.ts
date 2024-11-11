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
  const posts = await AppDataSource.getRepository(Post)
    .createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    .leftJoinAndSelect('post.comments', 'comments') // Lấy liên kết với comments
    .leftJoinAndSelect('comments.user', 'commentUser') // Lấy user của comment
    .leftJoinAndSelect('post.likes', 'likes') // Lấy liên kết với likes
    .leftJoinAndSelect('likes.user', 'likeUser') // Lấy user của like
    .where('post.user.id = :userId', { userId })
    .orderBy('post.created_at', 'DESC')
    .getMany();

  const formattedPosts = posts.map(post => ({
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
    comments: post.comments?.map(comment => ({
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
      replies: comment.replies?.map(reply => ({
        comment_id: reply.comment_id,
        content: reply.content,
        created_at: reply.created_at,
        user: {
          id: reply.user?.id,
          username: reply.user?.username,
          full_name: comment.user?.full_name,
          avatar_url: reply.user?.avatar_url,
        },
      })) || []
    })) || [],
    likes: post.likes?.map(like => ({
      like_id: like.like_id,
      user: {
        id: like.user?.id,
        full_name: like.user?.full_name,
        username: like.user?.username,
        avatar_url: like.user?.avatar_url,
      },
    })) || []
  }));

  return { posts: formattedPosts };
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
