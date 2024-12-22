// src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/user.entity';

const userRepository = AppDataSource.getRepository(User);
export const registerUser = async (
  username: string,
  password: string,
  fullName: string,
  email: string
) => {
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

export const findOrCreateUser = async (payload: {
  email: string;
  full_name: string;
  googleId: string;
  avatarUrl?: string;
}) => {
  const { email, full_name, googleId, avatarUrl } = payload;

  // Kiểm tra tài khoản đã tồn tại
  let user = await userRepository.findOne({ where: { email } });
  if (!user) {
    // Tạo mới tài khoản nếu chưa tồn tại
    user = userRepository.create({
      username: '',
      full_name: full_name,
      email,
      avatar_url: avatarUrl || undefined,
      password: '', // Không dùng mật khẩu cho Google login
    });
    await userRepository.save(user);
  }

  return user;
};

export const generateJWT = (userId: string) => {
  const jwtSecret = process.env.JWT_SECRET as string;
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};
