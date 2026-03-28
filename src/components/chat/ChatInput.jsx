"use client";
import { useState, useRef } from "react";
import { FiSend, FiPaperclip, FiX } from "react-icons/fi";
import clsx from "clsx";

export function ChatInput({ onSend, onUpload, disabled, isUploading }) {
    const [message, setMessage] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !onUpload) return;

        setAttachment({
            file,
            name: file.name,
            type: file.type.startsWith("image/") ? "image" : "document",
            preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        });
    };

    const handleSend = async () => {
        if (!message.trim() && !attachment) return;

        try {
            let attachmentData = null;

            if (attachment?.file) {
                setUploadProgress(10);
                const result = await onUpload(attachment.file);
                setUploadProgress(100);
                attachmentData = {
                    attachment_url: result.url,
                    attachment_type: result.type,
                    attachment_name: result.name,
                };
            }

            await onSend({
                content: message.trim(),
                ...attachmentData,
            });

            setMessage("");
            setAttachment(null);
            setUploadProgress(0);
        } catch (error) {
            console.error("Send error:", error);
            setUploadProgress(0);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const removeAttachment = () => {
        if (attachment?.preview) {
            URL.revokeObjectURL(attachment.preview);
        }
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="border-t border-neutral-200 p-3 bg-white">
            {attachment && (
                <div className="mb-3 p-2 bg-neutral-50 rounded border border-neutral-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            {attachment.preview ? (
                                <img
                                    src={attachment.preview}
                                    alt="Attachment preview"
                                    className="w-10 h-10 object-cover rounded"
                                />
                            ) : (
                                <div className="w-10 h-10 flex items-center justify-center bg-neutral-200 rounded">
                                    <FiPaperclip className="w-5 h-5 text-neutral-500" />
                                </div>
                            )}
                            <span className="text-sm text-neutral-700 truncate">
                                {attachment.name}
                            </span>
                        </div>
                        <button
                            onClick={removeAttachment}
                            className="p-1 text-neutral-400 hover:text-red-500"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                    {isUploading && (
                        <div className="mt-2 h-1 bg-neutral-200 rounded overflow-hidden">
                            <div
                                className="h-full bg-neutral-900 transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-end gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled || isUploading}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className={clsx(
                        "p-2 text-neutral-500 hover:text-neutral-900 transition-colors rounded",
                        (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <FiPaperclip className="w-5 h-5" />
                </button>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={disabled || isUploading}
                    rows={1}
                    className="flex-1 resize-none border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50"
                    style={{ maxHeight: "120px" }}
                />

                <button
                    onClick={handleSend}
                    disabled={disabled || isUploading || (!message.trim() && !attachment)}
                    className={clsx(
                        "p-2 rounded transition-colors",
                        (message.trim() || attachment) && !disabled && !isUploading
                            ? "bg-neutral-900 text-white hover:bg-neutral-800"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    )}
                >
                    <FiSend className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
