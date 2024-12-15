// src/services/like.service.ts
import { AppDataSource } from '../config/data-source';
import { Post } from '../entity/post.entity';
import { Like } from '../entity/like.entity';
import { User } from '../entity/user.entity';
import { Notification } from '../entity/notification.entity';
import { NotificationType } from '../enums/notifi.enum';

export const toggleLikePost = async (postId: string, userId: string) => {
  const postRepository = AppDataSource.getRepository(Post);
  const likeRepository = AppDataSource.getRepository(Like);
  const userRepository = AppDataSource.getRepository(User);
  const notificationRepository = AppDataSource.getRepository(Notification);

  const post = await postRepository.findOne({
    where: { post_id: postId },
    relations: ['user'],
  });
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

    // Xóa thông báo khi bỏ thích
    const notification = await notificationRepository.findOne({
      where: {
        receiver: post.user,
        sender: user,
        type: NotificationType.POST_LIKED,
      },
    });

    if (notification) {
      await notificationRepository.delete({ id: notification.id });
      console.log('Notification deleted successfully');
    } else {
      console.log('No notification found to delete');
    }
  } else {
    // Nếu chưa thích, thêm mới
    like = new Like();
    like.post = post;
    like.user = user;
    await likeRepository.save(like);
    post.like_count += 1;

    // Kiểm tra nếu người thích là chủ sở hữu bài viết thì không tạo thông báo
    if (post.user.id !== user.id) {
      // Tạo thông báo cho người sở hữu bài viết nếu không phải bài viết của chính họ
      const notification = new Notification();
      notification.receiver = post.user; // Người sở hữu bài viết
      notification.sender = user; // Người đã thích bài viết
      notification.type = NotificationType.POST_LIKED;
      notification.content = `đã thích bài viết của bạn.`; // Cập nhật nội dung thông báo
      notification.is_read = false;

      // Lưu thông báo vào cơ sở dữ liệu
      await notificationRepository.save(notification);
    }
  }

  // Cập nhật số lượng lượt thích trong bài viết
  await postRepository.save(post);

  // Trả về số lượt thích của bài viết
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
