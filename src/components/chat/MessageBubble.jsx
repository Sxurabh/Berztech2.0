"use client";
import { useMemo } from "react";
import { motion } from "framer-motion";
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

function Avatar({ src, name, size = "md" }) {
    const sizeClasses = {
        sm: "w-7 h-7 text-xs",
        md: "w-8 h-8 text-xs",
        lg: "w-10 h-10 text-sm"
    };
    
    const initial = name?.charAt(0)?.toUpperCase() || "?";
    
    if (src) {
        return (
            <img 
                src={src} 
                alt={name || "User"}
                className={clsx(
                    "rounded-full object-cover ring-2 ring-white",
                    sizeClasses[size]
                )}
            />
        );
    }
    
    return (
        <div className={clsx(
            "rounded-full flex items-center justify-center font-medium text-white flex-shrink-0",
            sizeClasses[size],
            "bg-gradient-to-br from-primary to-primary-dark"
        )}>
            {initial}
        </div>
    );
}

export function MessageBubble({ message, currentUserId }) {
    const isOwn = message.sender_id === currentUserId;
    const hasAttachment = !!message.attachment_url;
    
    const senderName = message.sender?.full_name || message.sender_name || "Unknown";
    const senderAvatar = message.sender?.avatar_url || null;

    // DEBUG
    console.log("[MESSAGE_BUBBLE] message:", {
        id: message.id,
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        sender: message.sender,
        senderName,
        senderAvatar,
        currentUserId,
        isOwn
    });

    const readStatus = useMemo(() => {
        const reads = message.reads || [];
        if (reads.length === 0) return "sent";
        if (reads.some((r) => r.user_id !== currentUserId)) return "read";
        return "delivered";
    }, [message.reads, currentUserId]);

    const ReadIcon = readStatus === "read" ? DoubleCheck : SingleCheck;
    const readColor = readStatus === "read" ? "text-blue-500" : "text-neutral-400";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "flex gap-2 mb-3",
                isOwn ? "flex-row-reverse" : "flex-row"
            )}
        >
            {!isOwn && (
                <Avatar src={senderAvatar} name={senderName} size="md" />
            )}

            <div className={clsx(
                "max-w-[75%] flex flex-col",
                isOwn ? "items-end" : "items-start"
            )}>
                {!isOwn && senderName && senderName !== "Unknown" && (
                    <span className="text-xs text-neutral-500 mb-1 px-1 font-medium">
                        {senderName}
                    </span>
                )}

                <div className={clsx(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    isOwn
                        ? "bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-br-md"
                        : "bg-white text-neutral-900 border border-neutral-100 rounded-bl-md"
                )}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>

                    {hasAttachment && (
                        <div className="mt-2">
                            <AttachmentPreview
                                attachment={{
                                    attachment_url: message.attachment_url,
                                    attachment_type: message.attachment_type,
                                    attachment_name: message.attachment_name,
                                }}
                            />
                        </div>
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
                        <span className={clsx("w-4 h-4 inline-flex items-center", readColor)}>
                            <ReadIcon className="w-full h-full" />
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
