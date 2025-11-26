import { NextResponse } from 'next/server';
import { chatService } from '@/services/chat.service';
import { getUserIdFromHeader } from '@/lib/jwt';
import { createChatSchema } from '@/lib/validators';
import { z } from 'zod';

const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return String(err);
};

export async function GET(req: Request) {
    try {
        const currentUserId = await getUserIdFromHeader();
        const chats = await chatService.getUserChats(currentUserId);
        return NextResponse.json(chats);
    } catch (err: unknown) {
        if (err instanceof Error) {
            const status = err.message.startsWith('Unauthorized') ? 401 : 500;
            return NextResponse.json({ error: err.message }, { status });
        }

        return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const currentUserId = await getUserIdFromHeader();
        const body = await req.json();

        const { email } = createChatSchema.parse(body);

        const chat = await chatService.createChatByEmail(currentUserId, email);
        return NextResponse.json(chat);
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
        }

        if (err instanceof Error) {
            const status = err.message === 'User not found' ? 404 : 500;
            return NextResponse.json({ error: err.message }, { status });
        }

        return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const currentUserId = await getUserIdFromHeader();

        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get("id");

        if (!chatId) {
            return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
        }

        await chatService.deleteChat(chatId, currentUserId);

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        if (err instanceof Error) {
            const status = err.message === "Chat not found" ? 404 : 500;
            return NextResponse.json({ error: err.message }, { status });
        }

        return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
}