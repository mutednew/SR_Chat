import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const chats = await prisma.chat.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                users: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        return NextResponse.json(chats);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching chats' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, currentUserId } = body;

        if (!email || !currentUserId) {
            return NextResponse.json({ error: 'Email and CurrentUser are required' }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'Пользователь с таким Email не найден' }, { status: 404 });
        }

        if (targetUser.id === currentUserId) {
            return NextResponse.json({ error: 'Нельзя создать чат с самим собой' }, { status: 400 });
        }

        const chat = await prisma.chat.create({
            data: {
                isGroup: false,
                users: {
                    connect: [
                        { id: currentUserId },
                        { id: targetUser.id }
                    ]
                }
            },
            include: {
                users: true
            }
        });

        return NextResponse.json(chat);

    } catch (error) {
        console.error("Ошибка создания чата:", error);
        return NextResponse.json({ error: 'Error creating chat' }, { status: 500 });
    }
}