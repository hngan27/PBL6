import { AppDataSource } from './config/data-source'; // Cấu hình data source
import { Post } from './entity/post.entity';
import { Like } from './entity/like.entity';
import { User } from './entity/user.entity';
import { faker } from '@faker-js/faker';

// Hàm tạo dữ liệu giả cho các bài viết
const createFakePosts = async (numberOfPosts: number) => {
  const postRepository = AppDataSource.getRepository(Post);
  const userRepository = AppDataSource.getRepository(User);

  // Lấy một số người dùng ngẫu nhiên
  const users = await userRepository.find();
  if (users.length === 0) {
    throw new Error('No users found in the database.');
  }

  for (let i = 0; i < numberOfPosts; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const post = new Post();
    post.user = randomUser;
    post.content = faker.lorem.paragraph();
    post.access_modifier = faker.helpers.arrayElement([
      'private',
      'friend',
      'public',
    ]);
    post.image_url = `https://picsum.photos/200/300?random=${Math.random()}`;
    post.like_count = 55;
    post.created_at = new Date();
    post.updated_at = new Date();

    await postRepository.save(post);
  }
};

// Hàm tạo dữ liệu giả cho lượt thích
const createFakeLikes = async (numberOfLikes: number) => {
  const likeRepository = AppDataSource.getRepository(Like);
  const postRepository = AppDataSource.getRepository(Post);
  const userRepository = AppDataSource.getRepository(User);

  // Lấy các bài viết và người dùng từ cơ sở dữ liệu
  const posts = await postRepository.find();
  const users = await userRepository.find();

  if (posts.length === 0 || users.length === 0) {
    throw new Error('No posts or users found in the database.');
  }

  for (let i = 0; i < numberOfLikes; i++) {
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const like = new Like();
    like.post = randomPost;
    like.user = randomUser;
    like.created_at = new Date();

    await likeRepository.save(like);
  }
};

// Hàm chính để chạy tạo dữ liệu giả
const main = async () => {
  try {
    await AppDataSource.initialize(); // Kết nối với cơ sở dữ liệu
    console.log('Database connection established.');

    // Tạo dữ liệu giả cho các bài viết và lượt thích
    await createFakePosts(20); // Tạo 20 bài viết
    console.log('Fake posts created.');

    await createFakeLikes(50); // Tạo 50 lượt thích
    console.log('Fake likes created.');

    await AppDataSource.destroy(); // Đóng kết nối
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error creating fake data:', error);
  }
};

main();
