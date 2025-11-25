'use client';

import React, { useEffect } from 'react';
import { List, Avatar, Badge, Spin } from 'antd';
import { useGetChatsQuery } from '@/store/services/chatsApi';
import { UserOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from "@/store/hooks";
import { socket } from '@/lib/socket';

export default function ChatList() {
    const currentUser = useAppSelector((state) => state.auth.user);
    const onlineUsers = useAppSelector((state) => state.online.users);

    const CURRENT_USER_ID = currentUser?.id;

    const { data: chats, isLoading } = useGetChatsQuery();
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        if (chats) {
            chats.forEach((chat) => {
                socket.emit('join_chat', chat.id);
            });
        }
    }, [chats]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-5">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <List
                itemLayout="horizontal"
                dataSource={chats}
                renderItem={(chat) => {
                    const otherUser = chat.users.find(u => u.id !== CURRENT_USER_ID) || chat.users[0];
                    const lastMessageObj = chat.messages[0];
                    const isActive = params.id === chat.id;

                    const isMyLastMessage = lastMessageObj?.senderId === CURRENT_USER_ID;
                    const messageText = lastMessageObj?.content || "Нет сообщений";

                    const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false;

                    return (
                        <div
                            onClick={() => router.push(`/${chat.id}`)}
                            className={`
                                cursor-pointer border-b border-gray-100 p-4 transition-colors duration-200
                                ${isActive ? 'bg-blue-50 border-r-4 border-r-blue-500' : 'hover:bg-gray-50 border-r-4 border-r-transparent'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <Badge
                                        dot={true}
                                        color={isOnline ? "#52c41a" : "#d9d9d9"}
                                        offset={[-4, 36]}
                                        style={{ width: 10, height: 10, border: '2px solid white' }}
                                    >
                                        <Avatar
                                            src={otherUser?.avatar}
                                            icon={<UserOutlined />}
                                            size={48}
                                            className="bg-blue-500"
                                        />
                                    </Badge>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                                            {chat.name || otherUser?.name || 'User'}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="text-sm truncate m-0 flex items-center gap-1">
                                        {isMyLastMessage && (
                                            <span className="text-blue-500 font-medium">Вы:</span>
                                        )}
                                        <span className={isMyLastMessage ? "text-gray-500" : "text-gray-800 font-medium"}>
                                            {messageText}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
}