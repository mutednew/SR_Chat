'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Spin, Avatar, Empty, Badge } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation } from '@/store/services/chatsApi';
import { useAppSelector } from "@/store/hooks";

interface ChatWindowProps {
    chatId: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
    const currentUser = useAppSelector((state) => state.auth.user);
    const CURRENT_USER_ID = currentUser?.id;

    const onlineUsers = useAppSelector((state) => state.online.users);

    const { data: messages = [], isLoading } = useGetMessagesQuery(chatId);
    const { data: chats } = useGetChatsQuery();
    const [sendMessage] = useSendMessageMutation();

    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !CURRENT_USER_ID) return;

        await sendMessage({
            chatId,
            content: inputText,
            senderId: CURRENT_USER_ID
        });

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
            <div className="h-16 border-b border-gray-200 flex items-center px-6 bg-white shadow-sm z-10 gap-3">
                {}
                <Badge dot color={isOnline ? "green" : "gray"} offset={[-6, 32]}>
                    <Avatar
                        src={otherUser?.avatar}
                        icon={<UserOutlined />}
                        className="bg-blue-500"
                        size="large"
                    />
                </Badge>

                <div>
                    <h3 className="font-bold text-gray-800 m-0 text-base">
                        {currentChat?.name || otherUser?.name || 'Unknown User'}
                    </h3>
                    {}
                    <span className={`text-xs ${isOnline ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center opacity-50">
                        <Empty description="Нет сообщений. Напишите первым!" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {messages.map((msg) => {
                            const isMyMessage = msg.senderId === CURRENT_USER_ID;

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${isMyMessage ? 'justify-end' : 'justify-start items-end gap-3'}`}
                                >
                                    {!isMyMessage && (
                                        <Avatar
                                            size="small"
                                            icon={<UserOutlined />}
                                            src={msg.sender?.avatar}
                                            className="flex-shrink-0 mb-1"
                                        />
                                    )}

                                    <div
                                        className={`
                                          max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm
                                          ${isMyMessage
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}
                                        `}
                                    >
                                        <p className="m-0 break-words">{msg.content}</p>
                                        <span className={`text-[10px] block text-right mt-1 opacity-70`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
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
                    />
                </div>
            </div>
        </div>
    );
}