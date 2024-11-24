// src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/user.entity';

export const registerUser = async (
  username: string,
  password: string,
  fullName: string,
  email: string
) => {
  const userRepository = AppDataSource.getRepository(User);

  // Kiểm tra xem tên người dùng hoặc email đã tồn tại chưa
  const existingUser = await userRepository.findOne({
    where: [{ username }, { email }],
  });
  if (existingUser) {
    throw new Error('Username or email already exists');
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tạo người dùng mới
  const user = new User();
  user.username = username;
  user.password = hashedPassword;
  user.full_name = fullName;
  user.email = email;

  // Lưu người dùng vào cơ sở dữ liệu
  await userRepository.save(user);
  return user; // hoặc trả về một thông điệp thành công
};

export const loginUser = async (email: string, password: string) => {
  const userRepository = AppDataSource.getRepository(User);

  // Tìm người dùng theo email
  const user = await userRepository.findOneBy({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Tạo JWT token
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, secret, {
    expiresIn: process.env.JWT_EXPIRE,
  });



  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      avatar_url: user.avatar_url,
      full_name: user.full_name,
      username: user.username,
    },
  };
};
