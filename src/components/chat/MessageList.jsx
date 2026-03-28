"use client";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";

export function MessageList({ messages, currentUserId }) {
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
