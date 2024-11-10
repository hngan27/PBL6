// src/seed.ts
import { AppDataSource } from './config/data-source';
import { User } from './entity/user.entity';
import { Post } from './entity/post.entity';
import { Comment } from './entity/comment.entity';
import { Like } from './entity/like.entity';
import { Message } from './entity/message.entity';
import { AccessModifier } from './enums/accessModifier.enum';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const seedDatabase = async () => {
  // Kết nối đến cơ sở dữ liệu
  await AppDataSource.initialize();

  // // Tạo dữ liệu giả cho User
  // const users: User[] = [];
  // for (let i = 0; i < 10; i++) {
  //   const user = new User();
  //   user.full_name = faker.person.fullName();
  //   // user.email = faker.internet.email();
  //   user.email = `user${i}@example.com`;
  //   const saltRounds = 10;
  //   user.password = await bcrypt.hash('123456', saltRounds);
  //   user.username = faker.internet.userName();
  //   user.avatar_url = faker.image.avatar();
  //   users.push(user);
  // }
  // await AppDataSource.getRepository(User).save(users);

  // // Tạo dữ liệu giả cho Post

  // const getRandomImageUrl = () => {
  //   const randomNumber = Math.floor(Math.random() * 1000);
  //   return `https://picsum.photos/640/480?random=${randomNumber}`;
  // };
  // const posts: Post[] = [];
  // for (let i = 0; i < 20; i++) {
  //   const post = new Post();
  //   post.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
  //   post.content = faker.lorem.paragraph();
  //   post.access_modifier = AccessModifier.Friend;
  //   post.image_url = getRandomImageUrl();
  //   posts.push(post);
  // }
  // await AppDataSource.getRepository(Post).save(posts);

  // // Tạo dữ liệu giả cho Comment
  // const comments: Comment[] = [];
  // for (let i = 0; i < 30; i++) {
  //   const comment = new Comment();
  //   comment.post = posts[Math.floor(Math.random() * posts.length)]; // Chọn ngẫu nhiên một post
  //   comment.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
  //   comment.content = faker.lorem.sentence();
  //   comments.push(comment);
  // }
  // await AppDataSource.getRepository(Comment).save(comments);

  // // Tạo dữ liệu giả cho Like
  // const likes: Like[] = [];
  // for (let i = 0; i < 50; i++) {
  //   const like = new Like();
  //   like.post = posts[Math.floor(Math.random() * posts.length)]; // Chọn ngẫu nhiên một post
  //   like.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
  //   likes.push(like);
  // }
  // await AppDataSource.getRepository(Like).save(likes);

  // Lấy danh sách người dùng từ cơ sở dữ liệu
  const users = await AppDataSource.getRepository(User).find();

  // Tạo dữ liệu giả cho Message (Tin nhắn)
  const messages: Message[] = [];
  for (let i = 0; i < 30; i++) {
    const message = new Message();
    message.sender = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một người gửi
    message.receiver = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một người nhận
    while (message.sender.id === message.receiver.id) {
      message.receiver = users[Math.floor(Math.random() * users.length)]; // Đảm bảo người nhận không phải người gửi
    }
    message.content = faker.lorem.sentence();
    message.timestamp = new Date(); // Lưu thời gian hiện tại với cả ngày và giờ
    messages.push(message);
  }
  await AppDataSource.getRepository(Message).save(messages);


  console.log('Fake data has been seeded to the database.');

  // Ngắt kết nối
  await AppDataSource.destroy();
};

// Chạy hàm tạo dữ liệu giả
seedDatabase().catch(error => {
  console.error('Error seeding database:', error);
});
