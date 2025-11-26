import { NextResponse } from 'next/server';
import { chatService } from "@/services/chat.service";
import { getUserIdFromHeader } from "@/lib/jwt";
import { createChatSchema } from "@/lib/validators";
import { z } from "zod";

export async function GET() {
    try {
        const chats = await chatService.getAllChats();

        return NextResponse.json(chats);
    } catch (err) {
        return NextResponse.json({ error: "Error fetching chats" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const currentUserId = await getUserIdFromHeader();
        const body = await req.json();

        const { email } = createChatSchema.parse(body);

        const chat = await chatService.createChatByEmail(currentUserId, email);

        return NextResponse.json(chat);
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
        }
        const status = err.message === "User not found" ? 404 : 500;

        return NextResponse.json({ error: err.message }, { status });
    }
}