import { prisma } from '@/lib/db';

export const messageService = {
    async getMessages(chatId: string, cursor?: string) {
        const limit = 20;

        const messages = await prisma.message.findMany({
            where: { chatId },
            take: limit,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: "desc" },
            include: { sender: true }
        });

        return messages.reverse();
    },

    async sendMessage(chatId: string, senderId: string, content: string) {
        const newMessage = await prisma.message.create({
            data: {
                content,
                chatId,
                senderId
            },
            include: { sender: true }
        });

        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
        });

        return newMessage;
    }
};