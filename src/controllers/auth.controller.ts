// src/controllers/authController.ts
import { Request, Response } from 'express';
import { loginUser } from '../services/auth.service';
import { AppDataSource } from '../config/data-source';
import { registerUser } from '../services/auth.service';
import { verifyGoogleToken } from '../services/googleAuth.service';
import { findOrCreateUser, generateJWT } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  const { username, password, full_name, email } = req.body;
  console.log(req.body);
  try {
    const newUser = await registerUser(username, password, full_name, email);
    res
      .status(201)
      .json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const token = await loginUser(email, password);
    res.cookie('jwt', token.token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // MS
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV !== 'development',
    });
    res.json({ token });
  } catch (error) {
    // Kiểm tra kiểu của error
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  const { token } = req.body; // Lấy token từ request body

  try {
    // Xác minh token của Google
    const payload = await verifyGoogleToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    // Lấy các trường từ payload
    const { email, name, sub: googleId, picture } = payload;

    // Kiểm tra các trường cần thiết
    if (!email || !googleId) {
      return res
        .status(400)
        .json({ message: 'Google token must include email and googleId' });
    }

    // Tìm hoặc tạo mới người dùng
    const user = await findOrCreateUser({
      email,
      full_name: name || '',
      googleId,
      avatarUrl: picture || '',
    });

    // Tạo JWT
    const authToken = generateJWT(user.id);

    // Trả về dữ liệu
    return res.status(200).json({
      token: authToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
