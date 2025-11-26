import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

const onlineUsers = new Map<string, string>();

export const setupSocketHandlers = (io: Server) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error: Token missing"));
        }

        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) return next(new Error("Server Error: No JWT_SECRET"));

            const decoded = jwt.verify(secret, secret) as { userId: string };
            (socket as any).userId = decoded.userId;
            next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = (socket as any).userId;

        console.log(`User connected (Auth): ${userId}`);
        onlineUsers.set(socket.id, userId);
        broadcastOnlineUsers();

        socket.on("join_chat", (chatId: string) => {
            socket.join(chatId);
        });

        socket.on("send_message", (message) => {
            io.to(message.chatId).emit("receive_message", message);
        });

        socket.on("disconnect", () => {
            onlineUsers.delete(socket.id);
            broadcastOnlineUsers();
        });

        function broadcastOnlineUsers() {
            const uniqueIds = Array.from(new Set(onlineUsers.values()));
            io.emit("online_users", uniqueIds);
        }
    });
};