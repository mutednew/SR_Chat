import { api } from './api';
import { socket } from '@/lib/socket';
import { IChat } from "@/types/chatType";
import { IMessage } from "@/types/messageType";

export const chatsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getChats: builder.query<IChat[], void>({
            query: () => "/chats",
            providesTags: ["Chat"],
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
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
            },
        }),

        getMessages: builder.query<IMessage[], string>({
            query: (chatId) => `/messages?chatId=${chatId}`,
            providesTags: (result, error, chatId) => [{ type: "Message", id: chatId }],
            async onCacheEntryAdded(chatId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                try {
                    await cacheDataLoaded;
                    socket.emit("join_chat", chatId);

                    const listener = (newMessage: IMessage) => {
                        if (newMessage.chatId !== chatId) return;
                        updateCachedData((draft) => {
                            if (!draft.find(m => m.id === newMessage.id)) {
                                draft.push(newMessage);
                            }
                        });
                    };

                    socket.on("receive_message", listener);
                    await cacheEntryRemoved;
                    socket.off("receive_message", listener);
                } catch {}
            },
        }),

        getMoreMessages: builder.query<IMessage[], { chatId: string; cursor: string }>({
            query: ({ chatId, cursor }) => `/messages?chatId=${chatId}&cursor=${cursor}`,
            async onQueryStarted({ chatId }, { queryFulfilled, dispatch }) {
                try {
                    const { data: olderMessages } = await queryFulfilled;
                    if (olderMessages.length > 0) {
                        dispatch(
                            chatsApi.util.updateQueryData("getMessages", chatId, (draft) => {
                                const uniqueOlderMessages = olderMessages.filter(
                                    (oldMsg) => !draft.find((existingMsg) => existingMsg.id === oldMsg.id)
                                );
                                draft.unshift(...uniqueOlderMessages);
                            })
                        );
                    }
                } catch {}
            }
        }),

        sendMessage: builder.mutation<IMessage, { chatId: string; content: string }>({
            query: (body) => ({
                url: "/messages",
                method: "POST",
                body,
            }),
            async onQueryStarted({ chatId }, { queryFulfilled, dispatch }) {
                try {
                    const { data: savedMessage } = await queryFulfilled;

                    dispatch(
                        chatsApi.util.updateQueryData("getMessages", chatId, (draft) => {
                            draft.push(savedMessage);
                        })
                    );

                    dispatch(
                        chatsApi.util.updateQueryData("getChats", undefined, (draft) => {
                            const chatToUpdate = draft.find((c) => c.id === chatId);
                            if (chatToUpdate) {
                                chatToUpdate.messages = [savedMessage];
                                chatToUpdate.updatedAt = new Date().toISOString();
                                draft.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                            }
                        })
                    );

                    socket.emit("send_message", savedMessage);
                } catch (err) {
                    console.error("Error sending message", err);
                }
            }
        }),

        createChat: builder.mutation<IChat, { email: string }>({
            query: (body) => ({
                url: "/chats",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Chat"],
        }),

        deleteChat: builder.mutation<void, string>({
            query: (chatId) => ({
                url: `/chats?id=${chatId}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Chat"],

            async onQueryStarted(chatId, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    chatsApi.util.updateQueryData("getChats", undefined, (draft) => {
                        const index = draft.findIndex((c) => c.id === chatId);

                        if (index !== -1) {
                            draft.splice(index, 1);
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
        })
    }),
});

export const {
    useGetChatsQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useCreateChatMutation,
    useLazyGetMoreMessagesQuery,
    useDeleteChatMutation,
} = chatsApi;