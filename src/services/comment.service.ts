import { AppDataSource } from '../config/data-source';
import { Comment } from '../entity/comment.entity';
import { Post } from '../entity/post.entity';
import { User } from '../entity/user.entity';
import { IsNull } from 'typeorm';
import { Notification } from '../entity/notification.entity';
import { NotificationType } from '../enums/notifi.enum';

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
  const notificationRepository = AppDataSource.getRepository(Notification);

  const post = await postRepository.findOne({
    where: { post_id: postId },
    relations: ['user'], // Lấy thông tin người sở hữu bài viết
  });
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
    // Tìm bình luận cha
    const parentComment = await commentRepository.findOne({
      where: { comment_id: parentCommentId },
      relations: ['user', 'replies', 'replies.user'], // Lấy thông tin người sở hữu và các phản hồi
    });

    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    comment.parent_comment = parentComment;

    // Tạo thông báo cho người sở hữu bình luận cha
    if (parentComment.user.id !== userId) {
      const replyNotification = new Notification();
      replyNotification.receiver = parentComment.user; // Người sở hữu bình luận cha
      replyNotification.sender = user; // Người trả lời
      replyNotification.type = NotificationType.COMMENT_REPLIED;
      replyNotification.content = `đã trả lời bình luận của bạn.`;
      replyNotification.is_read = false;

      await notificationRepository.save(replyNotification);
    }

    // Gửi thông báo cho những người khác đã trả lời bình luận này
    const otherRepliers = parentComment.replies
      .filter((reply) => reply.user.id !== userId) // Loại trừ người vừa trả lời
      .map((reply) => reply.user);

    const notifiedUsers = new Set(); // Tránh thông báo trùng lặp

    for (const replier of otherRepliers) {
      if (!notifiedUsers.has(replier.id)) {
        notifiedUsers.add(replier.id);

        const alsoReplyNotification = new Notification();
        alsoReplyNotification.receiver = replier; // Người dùng đã trả lời trước đó
        alsoReplyNotification.sender = user; // Người vừa trả lời
        alsoReplyNotification.type = NotificationType.COMMENT_REPLIED;
        alsoReplyNotification.content = `cũng đã trả lời về bình luận mà bạn đã tham gia.`;
        alsoReplyNotification.is_read = false;

        await notificationRepository.save(alsoReplyNotification);
      }
    }
  } else {
    comment.parent_comment = null;

    // Tạo thông báo bình luận bài viết
    if (post.user.id !== userId) {
      const commentNotification = new Notification();
      commentNotification.receiver = post.user; // Người sở hữu bài viết
      commentNotification.sender = user; // Người bình luận
      commentNotification.type = NotificationType.POST_COMMENTED;
      commentNotification.content = `đã bình luận bài viết của bạn.`;
      commentNotification.is_read = false;

      await notificationRepository.save(commentNotification);
    }
  }

  await commentRepository.save(comment);
  await postRepository.increment({ post_id: postId }, 'comment_count', 1);
  return comment;
};

export const getCommentsByPost = async (postId: string) => {
  const commentRepository = AppDataSource.getRepository(Comment);
  const comments = await commentRepository.find({
    where: { post: { post_id: postId }, parent_comment: IsNull() },
    relations: ['replies', 'user', 'replies.user'], // Thêm 'replies.user' để lấy thông tin người dùng đã reply
    order: { created_at: 'ASC' },
  });

  // Trả về các bình luận cùng với người dùng đã reply
  return comments.map(comment => ({
    comment_id: comment.comment_id,
    content: comment.content,
    image_url: comment.image_url,
    created_at: comment.created_at,
    user: {
      id: comment.user.id,
      username: comment.user.username,
      full_name: comment.user.full_name,
      avatar_url: comment.user.avatar_url,
    },
    replies: comment.replies.map(reply => ({
      reply_id: reply.comment_id,
      content: reply.content,
      created_at: reply.created_at,
      user: {
        id: reply.user.id,
        username: reply.user.username,
        full_name: reply.user.full_name,
        avatar_url: reply.user.avatar_url,
      },
    })),
  }));
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

  // Kiểm tra xem có cập nhật ảnh không, nếu không thì giữ lại ảnh cũ
  if (image_url !== null) {
    comment.image_url = image_url;
  }

  comment.updated_at = new Date();

  await commentRepository.save(comment);

  return comment;
};
