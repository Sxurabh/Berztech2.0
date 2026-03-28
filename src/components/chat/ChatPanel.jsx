"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX } from "react-icons/fi";
import clsx from "clsx";
import { useMessages, useUploadMessageAttachment } from "@/lib/hooks/useMessages";
import { createClient } from "@/lib/supabase/client";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

export function ChatPanel({ projectId, projectName, isOpen, onToggle }) {
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { messages, loading, sendMessage, markAsRead, isSending } = useMessages(projectId);
    const { upload } = useUploadMessageAttachment();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id || null);
        });
    }, []);

    useEffect(() => {
        if (!messages.length) return;
        const unreadOwn = messages.filter(
            (m) => m.sender_id !== currentUserId && 
            !(m.reads || []).some((r) => r.user_id === currentUserId)
        );
        unreadOwn.forEach((msg) => markAsRead(msg.id));
    }, [messages, currentUserId, markAsRead]);

    const handleSend = async (data) => {
        await sendMessage(data);
    };

    const handleUpload = async (file) => {
        setIsUploading(true);
        try {
            return await upload(file, projectId);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <button
                onClick={onToggle}
                className={clsx(
                    "fixed right-0 top-1/2 -translate-y-1/2 z-40",
                    "bg-neutral-900 text-white p-3 rounded-l-lg shadow-lg",
                    "hover:bg-neutral-800 transition-colors",
                    "flex items-center gap-1"
                )}
                style={{ right: isOpen ? "350px" : 0 }}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <FiX className="w-5 h-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                        >
                            <FiMessageSquare className="w-5 h-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isOpen && (
                    <span className="text-xs font-medium pr-1">Chat</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-[350px] bg-white border-l border-neutral-200 z-30 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50">
                            <div className="flex items-center gap-2">
                                <FiMessageSquare className="w-5 h-5 text-neutral-600" />
                                <h3 className="font-medium text-neutral-900 truncate">
                                    {projectName || "Project Chat"}
                                </h3>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-1 text-neutral-400 hover:text-neutral-600"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="animate-spin w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full" />
                            </div>
                        ) : (
                            <>
                                <MessageList
                                    messages={messages}
                                    currentUserId={currentUserId}
                                />
                                <ChatInput
                                    onSend={handleSend}
                                    onUpload={handleUpload}
                                    disabled={isSending}
                                    isUploading={isUploading}
                                />
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
