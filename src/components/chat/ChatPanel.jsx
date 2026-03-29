"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiMinimize2, FiBell } from "react-icons/fi";
import clsx from "clsx";
import { useMessages, useUploadMessageAttachment } from "@/lib/hooks/useMessages";
import { useTheirPresence } from "@/lib/hooks/useTheirPresence";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { createClient } from "@/lib/supabase/client";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

function Avatar({ src, name, size = "md" }) {
    const sizeClasses = {
        sm: "w-7 h-7 text-xs",
        md: "w-9 h-9 text-sm",
        lg: "w-11 h-11 text-base"
    };
    
    const initial = name?.charAt(0)?.toUpperCase() || "?";
    
    if (src) {
        return (
            <img 
                src={src} 
                alt={name || "User"}
                className={clsx(
                    "rounded-full object-cover ring-2 ring-white shadow-sm",
                    sizeClasses[size]
                )}
            />
        );
    }
    
    return (
        <div className={clsx(
            "rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0",
            sizeClasses[size],
            "bg-gradient-to-br from-primary to-primary-dark shadow-sm"
        )}>
            {initial}
        </div>
    );
}

export function ChatPanel({ 
    projectId, 
    projectName, 
    projectAvatar, 
    recipientId,
    recipientName,
    recipientAvatar,
    isOpen, 
    onToggle,
    showNotifications = true
}) {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const panelRef = useRef(null);
    const { messages, loading, error, sendMessage, markAsRead, isSending } = useMessages(projectId);
    const { upload } = useUploadMessageAttachment();
    const { unreadCount: notificationCount } = useNotifications();
    const [sendError, setSendError] = useState(null);

    const otherUserId = recipientId;
    console.log("[CHAT_PANEL] recipientId:", recipientId, "otherUserId:", otherUserId);
    const { isOnline, formattedLastSeen } = useTheirPresence(otherUserId);
    console.log("[CHAT_PANEL] Their Presence - isOnline:", isOnline, "lastSeen:", formattedLastSeen);

    const displayName = recipientName || projectName || "Chat";
    const displayAvatar = recipientAvatar || projectAvatar;

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id || null);
        });
    }, []);

    useEffect(() => {
        if (!messages.length || !currentUserId) return;
        
        const unreadFromOthers = messages.filter(
            (m) => m.sender_id !== currentUserId && 
            !(m.reads || []).some((r) => r.user_id === currentUserId)
        );
        unreadFromOthers.forEach((msg) => markAsRead(msg.id));
    }, [messages, currentUserId, markAsRead]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                const toggleButton = document.querySelector("[data-chat-toggle]");
                if (toggleButton && !toggleButton.contains(event.target)) {
                    if (!document.querySelector("[data-chat-backdrop]")) {
                        onToggle();
                    }
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onToggle]);

    const handleSend = async (data) => {
        setSendError(null);
        try {
            await sendMessage(data);
        } catch (err) {
            setSendError(err.message || "Failed to send message");
            throw err;
        }
    };

    const handleUpload = async (file) => {
        setIsUploading(true);
        try {
            return await upload(file, projectId);
        } finally {
            setIsUploading(false);
        }
    };

    const toggleMinimize = (e) => {
        e.stopPropagation();
        setMinimized(!minimized);
    };

    const unreadMessagesCount = messages.filter(
        m => m.sender_id !== currentUserId && 
        !(m.reads || []).some(r => r.user_id === currentUserId)
    ).length;

    const hasUnread = unreadMessagesCount > 0;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        data-chat-backdrop
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 bg-black/20 z-30"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) onToggle();
                        }}
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            <motion.button
                data-chat-toggle
                onClick={onToggle}
                className={clsx(
                    "fixed z-50 transition-all duration-300",
                    "bg-gradient-to-br from-neutral-900 to-neutral-800 text-white",
                    "hover:from-neutral-800 hover:to-neutral-700",
                    "shadow-lg hover:shadow-xl",
                    "flex items-center justify-center",
                    isOpen 
                        ? "bottom-6 right-6 w-12 h-12 rounded-full" 
                        : "bottom-6 right-6 w-14 h-14 rounded-full",
                    minimized && "w-12 h-12 rounded-full",
                    hasUnread && !isOpen && "ring-2 ring-primary ring-offset-2"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.15 }}
                        >
                            <FiMinimize2 className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.15 }}
                            className="relative"
                        >
                            <FiMessageSquare className="w-5 h-5" />
                            {hasUnread && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full"
                                >
                                    {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                                </motion.span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isOpen && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="absolute left-full ml-3 text-sm font-medium text-neutral-700 bg-white px-3 py-1.5 rounded-full shadow-md whitespace-nowrap"
                    >
                        {displayName}
                    </motion.span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && !minimized && (
                    <>
                        <motion.div
                            ref={panelRef}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="hidden lg:flex fixed z-40 flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
                            style={{
                                bottom: "90px",
                                right: "24px",
                                width: "360px",
                                height: "520px",
                                maxHeight: "calc(100vh - 120px)",
                            }}
                        >
                            <ChatPanelHeader
                                displayName={displayName}
                                displayAvatar={displayAvatar}
                                isOnline={isOnline}
                                formattedLastSeen={formattedLastSeen}
                                onToggle={onToggle}
                                onMinimize={toggleMinimize}
                                showNotifications={showNotifications}
                            />
                            <MessageList
                                messages={messages}
                                currentUserId={currentUserId}
                                isLoading={loading}
                            />
                            {sendError && (
                                <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm flex items-center justify-between">
                                    <span>{sendError}</span>
                                    <button
                                        onClick={() => setSendError(null)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <ChatInput
                                onSend={handleSend}
                                onUpload={handleUpload}
                                disabled={isSending}
                                isUploading={isUploading}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed left-0 right-0 bottom-0 max-h-[70vh] bg-white rounded-t-2xl shadow-2xl z-40 flex flex-col lg:hidden"
                        >
                            <ChatPanelHeader
                                displayName={displayName}
                                displayAvatar={displayAvatar}
                                isOnline={isOnline}
                                formattedLastSeen={formattedLastSeen}
                                onToggle={onToggle}
                                showNotifications={showNotifications}
                                isMobile
                            />
                            <MessageList
                                messages={messages}
                                currentUserId={currentUserId}
                                isLoading={loading}
                            />
                            {sendError && (
                                <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm flex items-center justify-between">
                                    <span>{sendError}</span>
                                    <button
                                        onClick={() => setSendError(null)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <ChatInput
                                onSend={handleSend}
                                onUpload={handleUpload}
                                disabled={isSending}
                                isUploading={isUploading}
                                isMobile
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function ChatPanelHeader({ displayName, displayAvatar, isOnline, formattedLastSeen, onToggle, onMinimize, showNotifications, isMobile }) {
    // Handle missing or unknown last seen - show "Offline" instead
    const statusText = isOnline ? "Online" : (formattedLastSeen && formattedLastSeen !== "Unknown" ? formattedLastSeen : "Offline");
    
    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
            <div className="flex items-center gap-3 min-w-0">
                <motion.div 
                    className="relative flex-shrink-0"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Avatar src={displayAvatar} name={displayName} size="lg" />
                    <span className={clsx(
                        "absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full",
                        isOnline ? "bg-green-500" : "bg-neutral-400"
                    )} />
                </motion.div>
                <div className="flex flex-col min-w-0">
                    <h3 className="font-semibold text-neutral-900 text-sm truncate">
                        {displayName}
                    </h3>
                    <span className={clsx(
                        "text-xs truncate",
                        isOnline ? "text-green-600 font-medium" : "text-neutral-500"
                    )}>
                        {statusText}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {onMinimize && (
                    <button
                        onClick={onMinimize}
                        aria-label="Minimize chat"
                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"
                    >
                        <FiMinimize2 className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={onToggle}
                    aria-label="Close chat"
                    className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"
                >
                    <FiX className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
