'use client';

import React, { useEffect, memo } from 'react';
import { List, Avatar, Badge, Spin, Button, Popconfirm, App } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useGetChatsQuery, useDeleteChatMutation } from '@/store/services/chatsApi';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from "@/store/hooks";
import { socket } from "@/lib/socket";

interface ApiError {
    data?: {
        error?: string;
    };
    message?: string;
}

const ChatList = () => {
    const currentUser = useAppSelector((state) => state.auth.user);
    const onlineUsers = useAppSelector((state) => state.online.users);
    const CURRENT_USER_ID = currentUser?.id;

    const { data: chats, isLoading } = useGetChatsQuery();
    const [deleteChat, { isLoading: isDeleting }] = useDeleteChatMutation();

    const router = useRouter();
    const params = useParams();

    const { message } = App.useApp();

    useEffect(() => {
        if (chats) {
            chats.forEach((chat) => socket.emit("join_chat", chat.id));
        }
    }, [chats]);

    const handleDelete = async (e: React.MouseEvent<HTMLElement> | undefined, chatId: string) => {
        e?.stopPropagation();

        try {
            await deleteChat(chatId).unwrap();
            message.success('Chat deleted');

            if (params?.id === chatId) {
                router.push('/');
            }
        } catch (err: unknown) {
            const apiError = err as ApiError;
            const errorMessage = apiError.data?.error || apiError.message || 'Cannot delete chat';
            message.error(errorMessage);
        }
    };

    if (isLoading) return <div className="p-5 text-center"><Spin /></div>;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <List
                dataSource={chats}
                renderItem={(chat) => {
                    const otherUser = chat.users.find(u => u.id !== CURRENT_USER_ID) || chat.users[0];
                    const lastMessageObj = chat.messages[0];
                    const isActive = params.id === chat.id;
                    const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false;

                    return (
                        <div
                            key={chat.id}
                            onClick={() => router.push(`/${chat.id}`)}
                            className={`
                                group relative cursor-pointer border-b border-gray-100 p-4 transition-colors duration-200
                                ${isActive ? "bg-blue-50 border-r-4 border-r-blue-500" : "hover:bg-gray-50 border-r-4 border-r-transparent"}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <Badge dot={true} color={isOnline ? "#52c41a" : "#d9d9d9"} offset={[-4, 36]} style={{ border: "2px solid white" }}>
                                        <Avatar src={otherUser?.avatar} icon={<UserOutlined />} size={48} className="bg-blue-500" />
                                    </Badge>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate pr-2">
                                            {chat.name || otherUser?.name || "User"}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(chat.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <div className="text-sm truncate m-0 flex items-center gap-1 text-gray-500">
                                        {lastMessageObj?.content || "No messages"}
                                    </div>
                                </div>
                            </div>

                            <div
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Popconfirm
                                    title="Do you really want to delete the chat?"
                                    description="This action cannot be undone."
                                    onConfirm={(e) => handleDelete(e, chat.id)}
                                    onCancel={(e) => e?.stopPropagation()}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        loading={isDeleting}
                                        className="hover:bg-red-50"
                                    />
                                </Popconfirm>
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
};

export default memo(ChatList);