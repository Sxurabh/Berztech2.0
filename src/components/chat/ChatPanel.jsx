"use client";

import { useState, useEffect, useRef } from "react";
import { FiMessageSquare, FiX, FiFile, FiSend, FiPaperclip } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useMessages, useUploadMessageAttachment } from "@/lib/hooks/useMessages";

export function ChatPanel({ projectId, projectName, isOpen, onToggle }) {
    const [messageInput, setMessageInput] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    const { messages, loading, isSending, sendMessage } = useMessages(projectId);
    const { upload } = useUploadMessageAttachment();

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [messageInput]);

    const handleSend = async () => {
        if (!messageInput.trim()) return;

        try {
            await sendMessage({ content: messageInput.trim() });
            setMessageInput("");
        } catch (error) {
            console.error("Send error:", error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const result = await upload(file, projectId);
            await sendMessage({
                content: "",
                attachment_url: result.url,
                attachment_type: file.type.startsWith("image/") ? "image" : "document",
                attachment_name: file.name,
            });
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const isImage = (msg) => msg.attachment_type === "image" || (msg.attachment_url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(msg.attachment_url));

    return (
        <>
            <button
                onClick={onToggle}
                className="fixed bottom-6 right-6 z-50 p-4 bg-neutral-900 text-white rounded-full shadow-lg hover:bg-neutral-800 transition-colors"
                title="Open Chat"
            >
                <FiMessageSquare className="w-6 h-6" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 400, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 400, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed bottom-6 right-6 z-[100] w-[380px] h-[560px] max-h-[calc(100vh-120px)] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-neutral-200"
                    >
                        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 text-white border-b border-neutral-800">
                            <div className="flex items-center gap-2">
                                <FiMessageSquare className="w-5 h-5" />
                                <span className="font-space-grotesk font-medium">
                                    {projectName || "Project"} Messages
                                </span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-1 hover:bg-neutral-800 rounded transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                                    <FiMessageSquare className="w-12 h-12 mb-2 opacity-30" />
                                    <p className="text-sm">No messages yet</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={clsx(
                                            "flex flex-col",
                                            msg.sender === "admin" || msg.is_from_admin ? "items-end" : "items-start"
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                                                msg.sender === "admin" || msg.is_from_admin
                                                    ? "bg-neutral-900 text-white"
                                                    : "bg-white border border-neutral-200 text-neutral-900"
                                            )}
                                        >
                                            {msg.attachment_url && (
                                                <div className="mb-2">
                                                    {isImage(msg) ? (
                                                        <img
                                                            src={msg.attachment_url}
                                                            alt="Attachment"
                                                            className="max-w-full rounded cursor-pointer hover:opacity-90"
                                                            onClick={() => window.open(msg.attachment_url, "_blank")}
                                                        />
                                                    ) : (
                                                        <a
                                                            href={msg.attachment_url}
                                                            download={msg.attachment_name}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-xs hover:underline"
                                                        >
                                                            <FiFile className="w-4 h-4" />
                                                            {msg.attachment_name || "Document"}
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {msg.content && (
                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-neutral-400 mt-1 px-1">
                                            {formatTime(msg.created_at)}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="border-t border-neutral-200 p-3 bg-white">
                            <div className="flex items-end gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    disabled={isUploading || isSending}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || isSending}
                                    className={clsx(
                                        "p-2 text-neutral-500 hover:text-neutral-900 transition-colors rounded",
                                        (isUploading || isSending) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <FiPaperclip className="w-5 h-5" />
                                </button>

                                <textarea
                                    ref={textareaRef}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    disabled={isUploading || isSending}
                                    rows={1}
                                    className="flex-1 resize-none border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50"
                                />

                                <button
                                    onClick={handleSend}
                                    disabled={isUploading || isSending || !messageInput.trim()}
                                    className={clsx(
                                        "p-2 rounded transition-colors",
                                        messageInput.trim() && !isSending && !isUploading
                                            ? "bg-neutral-900 text-white hover:bg-neutral-800"
                                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                    )}
                                >
                                    <FiSend className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
