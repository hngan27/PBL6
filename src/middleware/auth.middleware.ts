// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../entity/user.entity';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' }); // Không có token
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      console.log('Decoded token:', decoded);
      return res.status(403).json({ message: 'Token verification failed' }); // Token không hợp lệ
    }

    if (decoded && typeof decoded === 'object' && 'userId' in decoded) {
      req.user = { id: decoded.userId } as User; // Đảm bảo userId có trong req.user
      console.log('User authenticated:', req.user);
      return next();
    } else {
      console.log('Decoded token is not valid');
      return res.status(403).json({ message: 'Invalid token structure' }); // Không có quyền
    }
  });
};
