import { NextResponse } from "next/server";
import { messageService } from "@/services/message.service";
import { getUserIdFromHeader } from "@/lib/jwt";
import { sendMessageSchema } from "@/lib/validators";
import { z } from "zod";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    const cursor = searchParams.get("cursor") || undefined;

    if (!chatId) return NextResponse.json([], { status: 400 });

    const messages = await messageService.getMessages(chatId, cursor);

    return NextResponse.json(messages);
}

export async function POST(req: Request) {
    try {
        const currentUserId = await getUserIdFromHeader();
        const body = await req.json();

        const { content, chatId } = sendMessageSchema.parse(body);

        const newMessage = await messageService.sendMessage(chatId, currentUserId, content);
        return NextResponse.json(newMessage);
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
        }

        const status = err.message.startsWith("Unauthorized") ? 401 : 500;
        return NextResponse.json({ error: err.message }, { status });
    }
}