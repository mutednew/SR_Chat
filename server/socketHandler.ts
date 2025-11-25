import { Server, Socket } from "socket.io";

const onlineUsers = new Map<string, string>();

export const setupSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("register_user", (userId: string) => {
            onlineUsers.set(socket.id, userId);
            brodcastOnlineUsers();
        });

        socket.on("join_chat", (chatId: string)=> {
            socket.join(chatId);

            console.log(`user ${socket.id} joined room: ${chatId}`);
        });

        socket.on("send_message", (message) => {
            console.log(`Server received message: ${message}`);

            io.to(message.chatId).emit("receive_message", message);
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });

        const brodcastOnlineUsers = () => {
            const uniqueIds = Array.from(new Set(onlineUsers.values()));
            io.emit("online_users", uniqueIds);
        }
    });
};