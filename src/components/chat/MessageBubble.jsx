"use client";
import { useMemo } from "react";
import clsx from "clsx";
import { AttachmentPreview } from "./AttachmentPreview";

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function SingleCheck({ className }) {
    return (
        <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 2.5L6 10L2.5 6.5" />
        </svg>
    );
}

function DoubleCheck({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 2.5L8 10L4.5 6.5" />
            <path d="M21.5 2.5L14 10L10.5 6.5" />
        </svg>
    );
}

export function MessageBubble({ message, currentUserId }) {
    const isOwn = message.sender_id === currentUserId;
    const hasAttachment = !!message.attachment_url;

    const readStatus = useMemo(() => {
        const reads = message.reads || [];
        if (reads.length === 0) return "sent";
        if (reads.some((r) => r.user_id !== currentUserId)) return "delivered";
        return "read";
    }, [message.reads, currentUserId]);

    const ReadIcon = readStatus === "read" ? DoubleCheck : SingleCheck;
    const readColor = readStatus === "read" ? "text-blue-500" : "text-neutral-400";

    return (
        <div className={clsx(
            "flex gap-2 mb-3",
            isOwn ? "flex-row-reverse" : "flex-row"
        )}>
            {!isOwn && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                    {message.sender?.full_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
            )}

            <div className={clsx(
                "max-w-[70%] flex flex-col",
                isOwn ? "items-end" : "items-start"
            )}>
                {!isOwn && message.sender?.full_name && (
                    <span className="text-xs text-neutral-500 mb-1 px-1">
                        {message.sender.full_name}
                    </span>
                )}

                <div className={clsx(
                    "rounded-lg px-3 py-2 text-sm",
                    isOwn
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-900"
                )}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>

                    {hasAttachment && (
                        <AttachmentPreview
                            attachment={{
                                attachment_url: message.attachment_url,
                                attachment_type: message.attachment_type,
                                attachment_name: message.attachment_name,
                            }}
                        />
                    )}
                </div>

                <div className={clsx(
                    "flex items-center gap-1 mt-1 px-1",
                    isOwn ? "flex-row-reverse" : "flex-row"
                )}>
                    <span className="text-[10px] text-neutral-400">
                        {formatTime(message.created_at)}
                    </span>
                    {isOwn && (
                        <span className={clsx("w-3 h-3 inline-flex items-center", readColor)}>
                            <ReadIcon className="w-full h-full" />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
