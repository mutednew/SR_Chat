import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';

export const useChatScroll = (
    messages: any[],
    isFetching: boolean,
    chatId: string,
    hasMore: boolean,
    onLoadMore: () => void
) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const prevScrollHeightRef = useRef(0);
    const prevLastMessageIdRef = useRef<string | null>(null);
    const hasInitializedRef = useRef(false);
    const [isObserverReady, setIsObserverReady] = useState(false);

    useEffect(() => {
        hasInitializedRef.current = false;
        setIsObserverReady(false);
        prevScrollHeightRef.current = 0;
        prevLastMessageIdRef.current = null;
    }, [chatId]);

    useLayoutEffect(() => {
        const container = chatContainerRef.current;
        if (!container || messages.length === 0) return;

        const currentLastMessageId = messages[messages.length - 1].id;

        if (!hasInitializedRef.current) {
            container.scrollTop = container.scrollHeight;
            hasInitializedRef.current = true;
            prevLastMessageIdRef.current = currentLastMessageId;
            setTimeout(() => setIsObserverReady(true), 500);
            return;
        }

        if (isFetching && prevScrollHeightRef.current > 0) {
            return;
        }

        if (!isFetching && prevScrollHeightRef.current > 0) {
            const newScrollHeight = container.scrollHeight;
            const diff = newScrollHeight - prevScrollHeightRef.current;
            container.scrollTop = diff;
            prevScrollHeightRef.current = 0;
            return;
        }

        if (currentLastMessageId !== prevLastMessageIdRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            prevLastMessageIdRef.current = currentLastMessageId;
        }

    }, [messages, isFetching, chatId]);

    useEffect(() => {
        if (!isObserverReady || isFetching || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (chatContainerRef.current) {
                        prevScrollHeightRef.current = chatContainerRef.current.scrollHeight;
                    }
                    onLoadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) observer.observe(observerTarget.current);

        return () => {
            if (observerTarget.current) observer.unobserve(observerTarget.current);
        };
    }, [observerTarget, isFetching, hasMore, isObserverReady, onLoadMore]);

    return { chatContainerRef, messagesEndRef, observerTarget };
};