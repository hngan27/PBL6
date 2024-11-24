// // src/seed.ts
// import { AppDataSource } from './config/data-source';
// import { User } from './entity/user.entity';
// import { Post } from './entity/post.entity';
// import { Comment } from './entity/comment.entity';
// import { Like } from './entity/like.entity';
// import { Message } from './entity/message.entity';
// import { AccessModifier } from './enums/accessModifier.enum';
// import { faker } from '@faker-js/faker';
// import bcrypt from 'bcrypt';

// // const seedDatabase = async () => {
// //   // Kết nối đến cơ sở dữ liệu
// //   await AppDataSource.initialize();

// //   // // Tạo dữ liệu giả cho User
// //   // const users: User[] = [];
// //   // for (let i = 0; i < 10; i++) {
// //   //   const user = new User();
// //   //   user.full_name = faker.person.fullName();
// //   //   // user.email = faker.internet.email();
// //   //   user.email = `user${i}@example.com`;
// //   //   const saltRounds = 10;
// //   //   user.password = await bcrypt.hash('123456', saltRounds);
// //   //   user.username = faker.internet.userName();
// //   //   user.avatar_url = faker.image.avatar();
// //   //   users.push(user);
// //   // }
// //   // await AppDataSource.getRepository(User).save(users);

// //   // // Tạo dữ liệu giả cho Post

// //   // const getRandomImageUrl = () => {
// //   //   const randomNumber = Math.floor(Math.random() * 1000);
// //   //   return `https://picsum.photos/640/480?random=${randomNumber}`;
// //   // };
// //   // const posts: Post[] = [];
// //   // for (let i = 0; i < 20; i++) {
// //   //   const post = new Post();
// //   //   post.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
// //   //   post.content = faker.lorem.paragraph();
// //   //   post.access_modifier = AccessModifier.Friend;
// //   //   post.image_url = getRandomImageUrl();
// //   //   posts.push(post);
// //   // }
// //   // await AppDataSource.getRepository(Post).save(posts);

// //   // // Tạo dữ liệu giả cho Comment
// //   // const comments: Comment[] = [];
// //   // for (let i = 0; i < 30; i++) {
// //   //   const comment = new Comment();
// //   //   comment.post = posts[Math.floor(Math.random() * posts.length)]; // Chọn ngẫu nhiên một post
// //   //   comment.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
// //   //   comment.content = faker.lorem.sentence();
// //   //   comments.push(comment);
// //   // }
// //   // await AppDataSource.getRepository(Comment).save(comments);

// //   // // Tạo dữ liệu giả cho Like
// //   // const likes: Like[] = [];
// //   // for (let i = 0; i < 50; i++) {
// //   //   const like = new Like();
// //   //   like.post = posts[Math.floor(Math.random() * posts.length)]; // Chọn ngẫu nhiên một post
// //   //   like.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
// //   //   likes.push(like);
// //   // }
// //   // await AppDataSource.getRepository(Like).save(likes);

// //   // Lấy danh sách người dùng từ cơ sở dữ liệu
// //   // const users = await AppDataSource.getRepository(User).find();

// //   // // Tạo dữ liệu giả cho Message (Tin nhắn)
// //   // const messages: Message[] = [];
// //   // for (let i = 0; i < 30; i++) {
// //   //   const message = new Message();
// //   //   message.sender = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một người gửi
// //   //   message.receiver = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một người nhận
// //   //   while (message.sender.id === message.receiver.id) {
// //   //     message.receiver = users[Math.floor(Math.random() * users.length)]; // Đảm bảo người nhận không phải người gửi
// //   //   }
// //   //   message.content = faker.lorem.sentence();
// //   //   message.timestamp = new Date(); // Lưu thời gian hiện tại với cả ngày và giờ
// //   //   messages.push(message);
// //   // }
// //   // await AppDataSource.getRepository(Message).save(messages);

// //   console.log('Fake data has been seeded to the database.');

// //   // Ngắt kết nối
// //   await AppDataSource.destroy();
// // };

// const seedDatabase = async () => {
//   // Kết nối đến cơ sở dữ liệu
//   await AppDataSource.initialize();

//   // Xóa dữ liệu cũ của các bảng Like và Comment
//   await AppDataSource.getRepository(Like).clear();
//   await AppDataSource.getRepository(Comment).clear();

//   // Lấy danh sách người dùng và bài viết từ cơ sở dữ liệu
//   const users = await AppDataSource.getRepository(User).find();
//   const posts = await AppDataSource.getRepository(Post).find();

//   // Tạo dữ liệu mẫu cho Comment
//   const comments: Comment[] = [];
//   for (let i = 0; i < 30; i++) {
//     const comment = new Comment();
//     comment.post = posts[Math.floor(Math.random() * posts.length)]; // Chọn ngẫu nhiên một post
//     comment.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
//     comment.content = faker.lorem.sentence();
//     comments.push(comment);

//     // Tăng comment_count của post
//     comment.post.comment_count += 1;
//     await AppDataSource.getRepository(Post).save(comment.post); // Lưu lại post với comment_count mới
//   }
//   await AppDataSource.getRepository(Comment).save(comments);

//   // Tạo dữ liệu mẫu cho Like
//   const likes: Like[] = [];
//   for (let i = 0; i < 50; i++) {
//     const like = new Like();
//     like.post = posts[Math.floor(Math.random() * posts.length)]; // Chọn ngẫu nhiên một post
//     like.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
//     likes.push(like);

//     // Tăng like_count của post
//     like.post.like_count += 1;
//     await AppDataSource.getRepository(Post).save(like.post); // Lưu lại post với like_count mới
//   }
//   await AppDataSource.getRepository(Like).save(likes);

//   console.log('Fake data has been seeded to the database.');

//   // Ngắt kết nối
//   await AppDataSource.destroy();
// };

// // Chạy hàm tạo dữ liệu giả
// seedDatabase().catch(error => {
//   console.error('Error seeding database:', error);
// });

//Ngannnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn

// import { AppDataSource } from './config/data-source';
// import { User } from './entity/user.entity';
// import { Post } from './entity/post.entity';
// import { Comment } from './entity/comment.entity';
// import { Like } from './entity/like.entity';
// import { Friend } from './entity/friend.entity';
// import { AccessModifier } from './enums/accessModifier.enum';
// import { faker } from '@faker-js/faker';

// const seedDatabase = async () => {
//   await AppDataSource.initialize();

//   // Xóa dữ liệu của bảng Like và Comment
//   await AppDataSource.getRepository(Like).clear();
//   await AppDataSource.getRepository(Comment).clear();

//   // Đặt lại `like_count` và `comment_count` của tất cả các bài viết về 0
//   await AppDataSource.getRepository(Post)
//     .createQueryBuilder()
//     .update(Post)
//     .set({ like_count: 0, comment_count: 0 })
//     .execute();

//   // Lấy dữ liệu User, Post và Friend đã có sẵn
//   const users = await AppDataSource.getRepository(User).find();
//   const posts = await AppDataSource.getRepository(Post).find({
//     relations: ['user', 'likes'],
//   });
//   const friends = await AppDataSource.getRepository(Friend).find({
//     where: { status: 'accepted' },
//     relations: ['user', 'friend'],
//   });

//   const comments: Comment[] = [];
//   const likes: Like[] = [];

//   for (const post of posts) {
//     // Chỉ thực hiện nếu bài viết có `access_modifier` là `public` hoặc `friend`
//     if (
//       post.access_modifier !== AccessModifier.Public &&
//       post.access_modifier !== AccessModifier.Friend
//     ) {
//       continue;
//     }

//     // Khởi tạo mảng `likes` nếu chưa có
//     if (!post.likes) {
//       post.likes = [];
//     }

//     // Lấy danh sách bạn bè của chủ sở hữu bài viết
//     const postOwnerFriends = friends.filter(
//       friend =>
//         friend.user &&
//         friend.friend && // Kiểm tra friend.user và friend.friend không undefined
//         (friend.user.id === post.user.id || friend.friend.id === post.user.id)
//     );

//     for (let i = 0; i < 5; i++) {
//       if (postOwnerFriends.length === 0) break;

//       // Lấy ngẫu nhiên một người bạn trong danh sách bạn bè của chủ sở hữu bài viết
//       const friendUserRelation =
//         postOwnerFriends[Math.floor(Math.random() * postOwnerFriends.length)];
//       const actionUser =
//         friendUserRelation.user.id === post.user.id
//           ? friendUserRelation.friend
//           : friendUserRelation.user;

//       if (!actionUser) continue; // Kiểm tra actionUser có hợp lệ

//       // Tạo Comment
//       const comment = new Comment();
//       comment.post = post;
//       comment.user = actionUser;
//       comment.content = faker.lorem.sentence();
//       post.comment_count += 1;
//       comments.push(comment);

//       // Kiểm tra xem actionUser đã like post chưa
//       //   const existingLike = await AppDataSource.getRepository(Like).findOne({
//       //     where: { post: post, user: actionUser },
//       //   });

//       //   if (!existingLike) {
//       //     // Tạo Like nếu chưa có
//       //     const like = new Like();
//       //     like.post = post;
//       //     like.user = actionUser;
//       //     post.like_count += 1;
//       //     likes.push(like);
//       //   }
//     }
//   }

//   // Lưu các comment và like vào cơ sở dữ liệu
//   await AppDataSource.getRepository(Comment).save(comments);
//   await AppDataSource.getRepository(Like).save(likes);

//   // Cập nhật lại post với số lượng comment và like
//   await AppDataSource.getRepository(Post).save(posts);

//   console.log('Fake likes and comments have been added to the database.');

//   // Ngắt kết nối
//   await AppDataSource.destroy();
// };

// // Chạy hàm tạo dữ liệu giả
// seedDatabase().catch(error => {
//   console.error('Error seeding database:', error);
// });



// thao thao thao thao thao thao

// src/seed.ts
import { AppDataSource } from './config/data-source';
import { User } from './entity/user.entity';
import { Post } from './entity/post.entity';
import { Comment } from './entity/comment.entity';
import { Like } from './entity/like.entity';
import { Friend } from './entity/friend.entity';
import { Message } from './entity/message.entity';
import { Notification } from './entity/notification.entity';
import { AccessModifier } from './enums/accessModifier.enum';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const seedDatabase = async () => {
  // Kết nối đến cơ sở dữ liệu
  await AppDataSource.initialize();

  // Xóa dữ liệu cũ của các bảng theo thứ tự phù hợp
  // await AppDataSource.getRepository(Like).clear();
  // await AppDataSource.getRepository(Comment).clear();
  // await AppDataSource.getRepository(Message).clear();
  // await AppDataSource.getRepository(Notification).clear();
  // await AppDataSource.getRepository(Post).clear();
  // await AppDataSource.getRepository(Friend).clear();
  // await AppDataSource.getRepository(User).clear();

  // Tạo dữ liệu giả cho User
  const users: User[] = [];
  for (let i = 0; i < 4; i++) {
    const user = new User();
    user.full_name = faker.person.fullName();
    user.email = faker.internet.email();
    const saltRounds = 10;
    user.password = await bcrypt.hash('123456', saltRounds);
    user.username = faker.internet.userName();
    user.avatar_url = faker.image.avatar();
    users.push(user);
  }
  await AppDataSource.getRepository(User).save(users);

  // Tạo dữ liệu giả cho Post
  const posts: Post[] = [];
  for (let i = 0; i < 20; i++) {
    const post = new Post();
    post.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
    post.content = faker.lorem.paragraph();
    post.access_modifier = AccessModifier.Friend;
    post.image_url = faker.image.url();
    posts.push(post);
  }
  await AppDataSource.getRepository(Post).save(posts);

  // Tạo dữ liệu giả cho Comment
  const comments: Comment[] = [];
  for (let i = 0; i < 30; i++) {
    const comment = new Comment();
    comment.post = posts[Math.floor(Math.random() * posts.length)]; // Chọn ngẫu nhiên một post
    comment.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
    comment.content = faker.lorem.sentence();
    comments.push(comment);
  }
  await AppDataSource.getRepository(Comment).save(comments);

  // Tạo dữ liệu giả cho Like
  const likes: Like[] = [];
  for (let i = 0; i < 50; i++) {
    const like = new Like();
    like.post = posts[Math.floor(Math.random() * posts.length)]; // Chọn ngẫu nhiên một post
    like.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
    likes.push(like);
  }
  await AppDataSource.getRepository(Like).save(likes);

  // Tạo dữ liệu giả cho Friend
  const friends: Friend[] = [];
  for (let i = 0; i < 20; i++) {
    const friend = new Friend();
    friend.user = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user
    friend.friend = users[Math.floor(Math.random() * users.length)]; // Chọn ngẫu nhiên một user khác
    friend.status = 'accepted';
    friends.push(friend);
  }
  await AppDataSource.getRepository(Friend).save(friends);

  // Tạo dữ liệu giả cho Message
  const messages: Message[] = [];
  const pairs = [
    { sender: users[0], receiver: users[1] },
    { sender: users[2], receiver: users[3] },
  ];

  for (const pair of pairs) {
    let currentSender = pair.sender;
    let currentReceiver = pair.receiver;
    for (let i = 0; i < 10; i++) {
      const message = new Message();
      message.sender = currentSender;
      message.receiver = currentReceiver;
      message.content = faker.lorem.sentence();
      message.timestamp = new Date(); // Lưu thời gian hiện tại với cả ngày và giờ
      messages.push(message);

      // Đảo ngược sender và receiver để tạo tin nhắn xen kẽ
      [currentSender, currentReceiver] = [currentReceiver, currentSender];
    }
  }
  await AppDataSource.getRepository(Message).save(messages);

  // Tạo dữ liệu giả cho Notification


  console.log('Fake data has been seeded to the database.');

  // Ngắt kết nối
  await AppDataSource.destroy();
};

// Chạy hàm tạo dữ liệu giả
seedDatabase().catch(error => {
  console.error('Error seeding database:', error);
});
