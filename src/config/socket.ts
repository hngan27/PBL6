import { Server, Socket } from "socket.io";
import http from "http";
import express from "express";


interface UserSocketMap {
    [userId: string]: string; // userId -> socketId
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3005"],
        methods: ['GET', 'POST'],
    },
});


const userSocketMap: UserSocketMap = {}; // {userId: socketId}


export const getReceiverSocketId = (userId: string): string | undefined => {
    return userSocketMap[userId];
}

io.on("connection", (socket: Socket) => {
    console.log("A user connected", socket.id);

    socket.emit('connectSuccess', { message: 'You are connected!' });

    const userId = socket.handshake.query.userId as string | undefined;

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    // Xử lý sự kiện ngắt kết nối
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        if (userId) {
            delete userSocketMap[userId];
        }
    });

});

export { io, app, server };
