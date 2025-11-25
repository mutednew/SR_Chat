import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
        return NextResponse.json([], { status: 400 });
    }

    const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        include: {
            sender: true
        }
    });

    return NextResponse.json(messages);
}

export async function POST(req: Request) {
    const body = await req.json();
    const { content, chatId, senderId } = body;

    const newMessage = await prisma.message.create({
        data: {
            content,
            chatId,
            senderId
        },
        include: {
            sender: true
        }
    });

    return NextResponse.json(newMessage);
}