"use client";
import { useState, useRef } from "react";
import { FiSend, FiPaperclip, FiX, FiRefreshCw } from "react-icons/fi";
import clsx from "clsx";

export function ChatInput({ onSend, onUpload, disabled, isUploading, isMobile }) {
    const [message, setMessage] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);
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
        setUploadError(null);
    };

    const handleSend = async () => {
        if (!message.trim() && !attachment) return;

        try {
            let attachmentData = null;

            if (attachment?.file) {
                setUploadProgress(10);
                setUploadError(null);
                try {
                    const result = await onUpload(attachment.file);
                    setUploadProgress(100);
                    attachmentData = {
                        attachment_url: result.url,
                        attachment_type: result.type,
                        attachment_name: result.name,
                    };
                } catch (uploadErr) {
                    setUploadError(uploadErr.message || "Upload failed");
                    throw uploadErr;
                }
            }

            await onSend({
                content: message.trim(),
                ...attachmentData,
            });

            setMessage("");
            setAttachment(null);
            setUploadProgress(0);
            setUploadError(null);
        } catch (error) {
            console.error("Send error:", error);
            if (!uploadError) {
                setUploadProgress(0);
            }
        }
    };

    const handleRetryUpload = async () => {
        if (!attachment?.file || !onUpload) return;
        setUploadError(null);
        setUploadProgress(10);
        try {
            const result = await onUpload(attachment.file);
            setUploadProgress(100);
            setUploadError(null);
        } catch (err) {
            setUploadError(err.message || "Upload failed");
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
        setUploadProgress(0);
        setUploadError(null);
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
                            className={clsx(
                                "text-neutral-400 hover:text-red-500 transition-colors",
                                isMobile ? "p-3" : "p-1"
                            )}
                        >
                            <FiX className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
                        </button>
                    </div>
                    {isUploading && !uploadError && (
                        <div className="mt-2 h-1 bg-neutral-200 rounded overflow-hidden">
                            <div
                                className="h-full bg-neutral-900 transition-all"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}
                    {uploadError && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-red-500 flex-1 truncate">{uploadError}</span>
                            <button
                                onClick={handleRetryUpload}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                                <FiRefreshCw className="w-3 h-3" />
                                Retry
                            </button>
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
                                "text-neutral-500 hover:text-neutral-900 transition-colors rounded",
                                (disabled || isUploading) && "opacity-50 cursor-not-allowed",
                                isMobile ? "p-3 min-w-[44px] min-h-[44px] flex items-center justify-center" : "p-2"
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
                    className={clsx(
                        "flex-1 resize-none border border-neutral-200 rounded px-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent disabled:opacity-50",
                        isMobile ? "py-3 min-h-[44px]" : "py-2"
                    )}
                    style={{ maxHeight: "120px" }}
                />

                <button
                    onClick={handleSend}
                    disabled={disabled || isUploading || (!message.trim() && !attachment)}
                    className={clsx(
                        "rounded transition-colors",
                        (message.trim() || attachment) && !disabled && !isUploading
                            ? "bg-neutral-900 text-white hover:bg-neutral-800"
                            : "bg-neutral-200 text-neutral-400 cursor-not-allowed",
                        isMobile ? "p-3 min-w-[44px] min-h-[44px] flex items-center justify-center" : "p-2"
                    )}
                >
                    <FiSend className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
