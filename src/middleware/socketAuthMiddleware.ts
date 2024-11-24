import jwt, { JwtPayload } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { User } from '../entity/user.entity';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
}

export interface AuthenticatedSocket extends Socket {
    user?: User;
}

export const authenticateSocket = (socket: AuthenticatedSocket, next: (err?: any) => void) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        console.log('No token provided');
        return next(new Error('No token provided'));
    }

    // Sử dụng Promise để xử lý verify và ép kiểu đúng
    try {
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;  // Ép kiểu rõ ràng thành JwtPayload

        if (decoded && 'userId' in decoded) {
            // Lấy thông tin người dùng từ decoded token và gán vào socket.user
            socket.user = { id: decoded.userId } as User;
            return next();
        } else {
            return next(new Error('Invalid token structure'));
        }
    } catch (err: unknown) {
        if (err instanceof Error) {  // Kiểm tra nếu lỗi là một instance của Error

            return next(new Error('Token verification failed'));
        } else {
            console.log('Unknown error during token verification');
            return next(new Error('Unknown error during token verification'));
        }
    }
};
