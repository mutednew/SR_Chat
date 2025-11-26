import { NextResponse } from "next/server";
import { chatService } from "@/services/chat.service";
import { getUserIdFromHeader } from "@/lib/jwt";
import { createChatSchema } from "@/lib/validators";
import { z } from "zod";

export async function GET(req: Request) {
    try {
        const currentUserId = await getUserIdFromHeader();

        const chats = await chatService.getUserChats(currentUserId);

        return NextResponse.json(chats);
    } catch (error: any) {
        const status = error.message.startsWith("Unauthorized") ? 401 : 500;
        return NextResponse.json({ error: "Error fetching chats" }, { status });
    }
}

export async function POST(req: Request) {
    try {
        const currentUserId = await getUserIdFromHeader();
        const body = await req.json();
        const { email } = createChatSchema.parse(body);

        const chat = await chatService.createChatByEmail(currentUserId, email);
        return NextResponse.json(chat);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        const status = error.message === "User not found" ? 404 : 500;
        return NextResponse.json({ error: error.message }, { status });
    }
}