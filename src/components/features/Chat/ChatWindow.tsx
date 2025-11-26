'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { Input, Button, Spin, Avatar, Empty, Badge } from 'antd';
import { SendOutlined, UserOutlined, LoadingOutlined } from '@ant-design/icons';
import { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation, useLazyGetMoreMessagesQuery } from '@/store/services/chatsApi';
import { useAppSelector } from "@/store/hooks";

interface ChatWindowProps {
    chatId: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
    const currentUser = useAppSelector((state) => state.auth.user);
    const CURRENT_USER_ID = currentUser?.id;
    const onlineUsers = useAppSelector((state) => state.online.users);

    // Загрузка сообщений
    const { data: messages = [], isLoading } = useGetMessagesQuery(chatId);

    // Подгрузка истории
    const [triggerGetMore, { isFetching: isLoadingMore }] = useLazyGetMoreMessagesQuery();

    const { data: chats } = useGetChatsQuery();
    const [sendMessage] = useSendMessageMutation();

    const [inputText, setInputText] = useState('');

    // Рефы
    const chatContainerRef = useRef<HTMLDivElement>(null); // Главный контейнер
    const observerTarget = useRef<HTMLDivElement>(null);   // Невидимый элемент вверху

    const [prevScrollHeight, setPrevScrollHeight] = useState(0);
    const [isObserverReady, setIsObserverReady] = useState(false);

    // 1. Сбрасываем готовность обсервера при смене чата
    useEffect(() => {
        setIsObserverReady(false);
    }, [chatId]);

    // 2. ГЛАВНАЯ ЛОГИКА СКРОЛЛА (useLayoutEffect - срабатывает до отрисовки)
    useLayoutEffect(() => {
        // Если данные загрузились и контейнер готов
        if (!isLoading && chatContainerRef.current) {

            // Сценарий А: Это ПЕРВАЯ загрузка (или смена чата) -> Мгновенно вниз
            // Проверяем по флагу isObserverReady (он false в начале)
            if (!isObserverReady) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;

                // Даем браузеру время отрисовать всё, потом включаем обсервер
                const timer = setTimeout(() => {
                    setIsObserverReady(true);
                }, 100); // 100мс достаточно
                return () => clearTimeout(timer);
            }

            // Сценарий Б: Это НОВОЕ сообщение (не история) -> Плавно вниз
            if (isObserverReady && !isLoadingMore) {
                // Проверяем, близко ли мы к низу, чтобы не скроллить, если юзер читает историю
                // Но для простоты пока скроллим всегда при своих/новых сообщениях
                chatContainerRef.current.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [messages, isLoading, chatId, isLoadingMore]); // Убрали isObserverReady из зависимостей, чтобы не циклило

    // 3. ЛОГИКА СОХРАНЕНИЯ ПОЗИЦИИ (При загрузке истории)
    useLayoutEffect(() => {
        if (!isLoadingMore && prevScrollHeight > 0 && chatContainerRef.current) {
            const container = chatContainerRef.current;
            const newScrollHeight = container.scrollHeight;
            const diff = newScrollHeight - prevScrollHeight;
            container.scrollTop = diff;
            setPrevScrollHeight(0);
        }
    }, [messages.length, isLoadingMore, prevScrollHeight]);


    const handleSend = async () => {
        if (!inputText.trim() || !CURRENT_USER_ID) return;
        await sendMessage({ chatId, content: inputText });
        setInputText('');
    };

    const loadMoreMessages = useCallback(() => {
        if (messages.length > 0 && !isLoadingMore && isObserverReady) {
            if (chatContainerRef.current) {
                setPrevScrollHeight(chatContainerRef.current.scrollHeight);
            }
            const oldestMessageId = messages[0].id;
            triggerGetMore({ chatId, cursor: oldestMessageId });
        }
    }, [messages, isLoadingMore, chatId, triggerGetMore, isObserverReady]);

    // 4. OBSERVER
    useEffect(() => {
        if (!isObserverReady) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore && messages.length >= 20) {
                    loadMoreMessages();
                }
            },
            { threshold: 0.5 } // Чуть раньше срабатывает
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) observer.unobserve(observerTarget.current);
        };
    }, [observerTarget, isLoadingMore, messages.length, loadMoreMessages, isObserverReady]);


    const currentChat = chats?.find(c => c.id === chatId);
    const otherUser = currentChat?.users.find(u => u.id !== CURRENT_USER_ID);
    const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false;

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Spin size="large" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="h-16 border-b border-gray-200 flex items-center px-6 bg-white shadow-sm z-10 gap-3">
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
                    <span className={`text-xs ${isOnline ? 'text-green-500 font-medium' : 'text-gray-400'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Контейнер скролла */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar relative"
                // Добавляем стиль для плавности только когда нужно, но лучше управлять через JS
                style={{ scrollBehavior: 'auto' }} // ВАЖНО: auto, чтобы JS мог делать и smooth, и instant
            >
                {/* Невидимый элемент для обсервера */}
                <div ref={observerTarget} className="h-4 w-full flex justify-center min-h-[20px]">
                    {isLoadingMore && <Spin indicator={<LoadingOutlined spin />} />}
                </div>

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
                        {/* Реф для конца сообщений нам больше не нужен для логики, но оставим для структуры */}
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