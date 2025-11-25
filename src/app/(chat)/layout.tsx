'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Button, Modal, Input, message, Spin } from 'antd';
import { LogoutOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/features/authSlice';
import { useRouter } from 'next/navigation';
import { useCreateChatMutation } from '@/store/services/chatsApi';
import ChatList from "@/components/features/Chat/ChatList";
import {socket} from "@/lib/socket";
import {setOnlineUsers} from "@/store/features/onlineSlice";

const { Sider, Content } = Layout;

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { token, user } = useAppSelector((state) => state.auth);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emailToInvite, setEmailToInvite] = useState('');
    const [createChat, { isLoading: isCreating }] = useCreateChatMutation();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (user?.id) {
            socket.emit('register_user', user.id);

            socket.on("online_users", (onlineIds: string[]) => {
                dispatch(setOnlineUsers(onlineIds));
            });
        }
    }, [user?.id, dispatch]);

    useEffect(() => {
        if (mounted && !token) {
            router.push('/login');
        }
    }, [token, router, mounted]);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    const handleCreateChat = async () => {
        if (!emailToInvite || !user) return;
        try {
            await createChat({
                email: emailToInvite,
                currentUserId: user.id
            }).unwrap();
            message.success('Чат успешно создан!');
            setIsModalOpen(false);
            setEmailToInvite('');
        } catch (e: any) {
            const errorMsg = e.data?.error || 'Ошибка при создании чата';
            message.error(errorMsg);
        }
    };

    if (!mounted || !token) {
        return <Spin fullscreen tip="Loading..." />;
    }

    return (
        <Layout className="h-screen overflow-hidden">
            <Sider width={350} theme="light" className="border-r border-gray-200 h-full flex flex-col">
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-800 m-0">Chats</h2>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate max-w-[100px]">{user?.name}</span>
                        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ChatList />
                </div>
            </Sider>

            <Layout>
                <Content className="h-full relative bg-white">
                    {children}
                </Content>
            </Layout>

            <Modal
                title="Новый чат"
                open={isModalOpen}
                onOk={handleCreateChat}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={isCreating}
            >
                <Input
                    placeholder="Введите Email пользователя"
                    value={emailToInvite}
                    onChange={e => setEmailToInvite(e.target.value)}
                />
            </Modal>
        </Layout>
    );
}