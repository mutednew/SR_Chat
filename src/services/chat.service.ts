import { prisma } from '@/lib/db';

export const chatService = {
    async getUserChats(currentUserId: string) {
        return prisma.chat.findMany({
            where: {
                users: {
                    some: {
                        id: currentUserId
                    }
                }
            },
            orderBy: { updatedAt: "desc" },
            include: {
                users: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1
                }
            }
        });
    },

    async createChatByEmail(currentUserId: string, targetEmail: string) {
        const targetUser = await prisma.user.findUnique({
            where: { email: targetEmail }
        });

        if (!targetUser) throw new Error("User not found");
        if (targetUser.id === currentUserId) throw new Error("Cannot create chat with yourself");

        const existingChat = await prisma.chat.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { users: { some: { id: currentUserId } } },
                    { users: { some: { id: targetUser.id } } }
                ]
            },
            include: { users: true }
        });

        if (existingChat) {
            return existingChat;
        }

        return prisma.chat.create({
            data: {
                isGroup: false,
                users: {
                    connect: [
                        { id: currentUserId },
                        { id: targetUser.id }
                    ]
                }
            },
            include: { users: true }
        });
    },

    async deleteChat(chatId: string, currentUserId: string) {
        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { users: true }
        });

        if (!chat) throw new Error("Chat not found");

        const isMember = chat.users.find((u) => u.id === currentUserId);

        if (!isMember) throw new Error("Cannot delete chat");

        await prisma.$transaction([
            prisma.message.deleteMany({ where: { chatId } }),

            prisma.chat.delete({
                where: { id: chatId },
            }),
        ]);

        return { success: true, id: chatId };
    }
};