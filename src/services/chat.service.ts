import { prisma } from '@/lib/db';

export const chatService = {
    async getAllChats() {
        return prisma.chat.findMany({
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

        if (!targetUser) {
            throw new Error("User not found");
        }

        if (targetUser.id === currentUserId) {
            throw new Error("Cannot create chat with yourself");
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
    }
};