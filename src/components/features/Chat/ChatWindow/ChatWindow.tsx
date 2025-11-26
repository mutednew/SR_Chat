'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, Spin, Empty, Badge, Avatar } from 'antd';
import { SendOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons';
import { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation, useLazyGetMoreMessagesQuery } from '@/store/services/chatsApi';
import { useAppSelector } from "@/store/hooks";

import { useChatScroll } from '@/hooks/useChatScroll';
import {MessageBubble} from "@/components/features/Chat/ChatWindow/MessageBubble";

interface ChatWindowProps {
    chatId: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
    const currentUser = useAppSelector((state) => state.auth.user);
    const CURRENT_USER_ID = currentUser?.id;
    const onlineUsers = useAppSelector((state) => state.online.users);

    const { data: messages = [], isLoading } = useGetMessagesQuery(chatId);
    const { data: chats } = useGetChatsQuery();

    const [triggerGetMore, { isFetching: isFetchingMore }] = useLazyGetMoreMessagesQuery();
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

    const [inputText, setInputText] = useState('');
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setHasMore(true);
    }, [chatId]);

    const loadMore = async () => {
        if (messages.length > 0) {
            const oldestMessageId = messages[0].id;
            const result = await triggerGetMore({ chatId, cursor: oldestMessageId });
            if (result.data && result.data.length < 20) {
                setHasMore(false);
            }
        }
    };

    const { chatContainerRef, messagesEndRef, observerTarget } = useChatScroll(
        messages,
        isFetchingMore,
        chatId,
        hasMore,
        loadMore
    );

    const handleSend = async () => {
        if (!inputText.trim() || !CURRENT_USER_ID) return;
        await sendMessage({ chatId, content: inputText });
        setInputText('');
    };

    const currentChat = chats?.find(c => c.id === chatId);
    const otherUser = currentChat?.users.find(u => u.id !== CURRENT_USER_ID);
    const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false;

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Spin size="large" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {}
            <div className="h-16 border-b border-gray-200 flex items-center px-6 bg-white shadow-sm z-10 gap-3">
                <Badge dot color={isOnline ? "green" : "gray"} offset={[-6, 32]}>
                    <Avatar src={otherUser?.avatar} icon={<UserOutlined />} className="bg-blue-500" size="large" />
                </Badge>
                <div>
                    <h3 className="font-bold text-gray-800 m-0 text-base">
                        {currentChat?.name || otherUser?.name || 'Unknown User'}
                    </h3>
                    <span className={`text-xs ${isOnline ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar relative"
                style={{ scrollBehavior: 'auto' }}
            >
                {hasMore && messages.length >= 20 && (
                    <div ref={observerTarget} className="h-8 w-full flex justify-center items-center min-h-[30px]">
                        {isFetchingMore && <Spin indicator={<LoadingOutlined spin style={{ fontSize: 20 }} />} />}
                    </div>
                )}

                {!hasMore && messages.length > 0 && (
                    <div className="text-center text-xs text-gray-400 py-4">Начало переписки</div>
                )}

                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-50">
                        <Empty description="Нет сообщений. Напишите первым!" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                msg={msg}
                                isMe={msg.senderId === CURRENT_USER_ID}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <Input
                        size="large"
                        placeholder="Напишите сообщение..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onPressEnter={handleSend}
                        className="rounded-full"
                    />
                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<SendOutlined />}
                        onClick={handleSend}
                        className="flex-shrink-0 bg-blue-600"
                        loading={isSending}
                    />
                </div>
            </div>
        </div>
    );
}