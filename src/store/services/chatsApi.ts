import { api } from './api';
import { socket } from '@/lib/socket';
import { IMessage } from "@/types/messageType";
import { IChat } from "@/types/chatType";

export const chatsApi = api.injectEndpoints({
    endpoints: (builder) => ({

        getChats: builder.query<IChat[], void>({
            query: () => '/chats',
            providesTags: ['Chat'],

            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                try {
                    await cacheDataLoaded;

                    const listener = (newMessage: IMessage) => {
                        updateCachedData((draft) => {
                            const chatToUpdate = draft.find((c) => c.id === newMessage.chatId);

                            if (chatToUpdate) {
                                chatToUpdate.messages = [newMessage];
                                chatToUpdate.updatedAt = new Date().toISOString();

                                draft.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                            }
                        });
                    };

                    socket.on("receive_message", listener);
                    await cacheEntryRemoved;
                    socket.off("receive_message", listener);
                } catch {}
            }
        }),

        getMessages: builder.query<IMessage[], string>({
            query: (chatId) => `/messages?chatId=${chatId}`,
            providesTags: (result, error, chatId) => [{ type: 'Message', id: chatId }],
            async onCacheEntryAdded(
                chatId,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
            ) {
                try {
                    await cacheDataLoaded;
                    socket.emit('join_chat', chatId);

                    const listener = (newMessage: IMessage) => {
                        if (newMessage.chatId !== chatId) return;
                        updateCachedData((draft) => {
                            draft.push(newMessage);
                        });
                    };

                    socket.on('receive_message', listener);
                    await cacheEntryRemoved;
                    socket.off('receive_message', listener);
                } catch {}
            },
        }),

        sendMessage: builder.mutation<IMessage, { chatId: string; content: string; senderId: string }>({
            query: (body) => ({
                url: '/messages',
                method: 'POST',
                body,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const { data: savedMessage } = await queryFulfilled;
                    socket.emit('send_message', savedMessage);
                } catch (err) {
                    console.error('Error sending message', err);
                }
            }
        }),

        createChat: builder.mutation<IChat, { email: string; currentUserId: string }>({
            query: (body) => ({
                url: '/chats',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Chat'],
        }),

    }),
});

export const {
    useGetChatsQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useCreateChatMutation
} = chatsApi;