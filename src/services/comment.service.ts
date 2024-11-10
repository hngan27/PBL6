import { AppDataSource } from '../config/data-source';
import { Comment } from '../entity/comment.entity';
import { Post } from '../entity/post.entity';
import { User } from '../entity/user.entity';
import { IsNull } from 'typeorm';

export const addComment = async (
  postId: string,
  userId: string,
  content: string,
  image_url: string | null,
  parentCommentId?: string
) => {
  const commentRepository = AppDataSource.getRepository(Comment);
  const postRepository = AppDataSource.getRepository(Post);
  const userRepository = AppDataSource.getRepository(User);

  const post = await postRepository.findOneBy({ post_id: postId });
  const user = await userRepository.findOneBy({ id: userId });

  if (!post || !user) {
    throw new Error('Post or User not found');
  }

  const comment = new Comment();
  comment.post = post;
  comment.user = user;
  comment.content = content;
  comment.image_url = image_url !== null ? image_url : null;

  if (parentCommentId) {
    // Tìm bình luận cha nếu có parentCommentId
    const parentComment = await commentRepository.findOneBy({
      comment_id: parentCommentId,
    });
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }
    comment.parent_comment = parentComment;
  } else {
    comment.parent_comment = null;
  }

  await commentRepository.save(comment);
  await postRepository.increment({ post_id: postId }, 'comment_count', 1);
  return comment;
};

export const getCommentsByPost = async (postId: string) => {
  const commentRepository = AppDataSource.getRepository(Comment);
  return await commentRepository.find({
    where: { post: { post_id: postId }, parent_comment: IsNull() },
    relations: ['replies', 'user'],
    order: { created_at: 'ASC' },
  });
};

export const deleteComment = async (commentId: string) => {
  const postRepository = AppDataSource.getRepository(Post);
  const commentRepository = AppDataSource.getRepository(Comment);

  // Lấy bình luận để xác định bài viết
  const comment = await commentRepository.findOne({
    where: { comment_id: commentId },
    relations: ['post'],
  });
  if (!comment) {
    throw new Error('Comment not found');
  }

  // Xóa bình luận
  await commentRepository.remove(comment);

  // Cập nhật số lượng bình luận cho bài viết
  await postRepository.increment(
    { post_id: comment.post.post_id },
    'comment_count',
    -1
  );

  return { message: 'Comment deleted successfully' };
};

export const updateComment = async (
  commentId: string,
  content: string,
  image_url: string | null
) => {
  const commentRepository = AppDataSource.getRepository(Comment);

  // Tìm bình luận
  const comment = await commentRepository.findOne({
    where: { comment_id: commentId },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  // Cập nhật nội dung bình luận
  comment.content = content;
  comment.image_url = image_url;
  comment.updated_at = new Date();

  await commentRepository.save(comment);

  return comment;
};
