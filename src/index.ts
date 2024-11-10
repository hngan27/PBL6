import createError, { HttpError } from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import http from 'http';

import indexRouter from './routes/index';
import { User } from './entity/user.entity';
import 'reflect-metadata';
import { AppDataSource } from './config/data-source';
import { Server } from 'socket.io';

import * as dotenv from 'dotenv';
dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// create and setup express app
const app = express();

// Tạo server HTTP từ express app
const server = http.createServer(app);

// Khởi tạo Socket.IO server
export const io = new Server(server, {
  cors: {
    origin: '*', // Thêm nguồn phù hợp ở đây
    methods: ['GET', 'POST'],
  },
});

// Lắng nghe các kết nối từ client
io.on('connection', socket => {
  console.log('User connected: ', socket.id);

  // Lắng nghe sự kiện gửi tin nhắn từ client
  socket.on('sendMessage', data => {
    console.log('Message received:', data);
    // Phát sự kiện 'newMessage' cho người nhận và người gửi
    io.to(data.receiverId).emit('newMessage', data);
    io.to(data.senderId).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// establish database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: Error | unknown) => {
    console.error('Error during Data Source initialization:', err);
  });

app.use(
  cors({
    credentials: true,
    origin: '*',
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// error handler
app.use(function (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

});

export default app;
