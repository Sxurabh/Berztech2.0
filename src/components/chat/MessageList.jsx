"use client";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ messages, currentUserId, isLoading = false }) {
    const listRef = useRef(null);
    const shouldAutoScroll = useRef(true);

    useEffect(() => {
        if (shouldAutoScroll.current && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const handleScroll = () => {
        if (!listRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
    };

    if (isLoading) {
        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 bg-neutral-200 rounded" />
                            <div className="h-4 bg-neutral-200 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
                No messages yet. Start the conversation!
            </div>
        );
    }

    return (
        <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4"
        >
            {messages.map((message) => (
                <MessageBubble
                    key={message.id}
                    message={message}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}
