'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ChatWindow from "@/components/features/Chat/ChatWindow";

export default function ChatPage() {
    const params = useParams();

    const rawId = params?.id;
    const chatId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!chatId) {
        return null;
    }

    return <ChatWindow chatId={chatId} />;
}