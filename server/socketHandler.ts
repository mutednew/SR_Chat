import { Server, Socket } from "socket.io";

export const setupSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

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
    });
};