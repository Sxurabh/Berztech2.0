"use client";
import { useState } from "react";
import { FiFile, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export function AttachmentPreview({ attachment, onRemove }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isImage = attachment.attachment_type === "image";

    if (isImage) {
        return (
            <>
                <div className="relative group mt-2">
                    <img
                        src={attachment.attachment_url}
                        alt={attachment.attachment_name || "Attachment"}
                        className="max-w-[200px] max-h-[150px] rounded object-cover cursor-pointer"
                        onClick={() => setIsExpanded(true)}
                    />
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <FiX className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
                            onClick={() => setIsExpanded(false)}
                        >
                            <img
                                src={attachment.attachment_url}
                                alt={attachment.attachment_name || "Attachment"}
                                className="max-w-full max-h-full object-contain"
                            />
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    return (
        <div className={clsx(
            "relative group flex items-center gap-3 mt-2 p-3 rounded border transition-colors",
            onRemove ? "bg-neutral-50 border-neutral-200 hover:border-neutral-300" : "bg-neutral-50 border-neutral-200"
        )}>
            <div className="p-2 bg-neutral-200 rounded">
                <FiFile className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                    {attachment.attachment_name || "Document"}
                </p>
            </div>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                >
                    <FiX className="w-4 h-4" />
                </button>
            )}
            <a
                href={attachment.attachment_url}
                download={attachment.attachment_name}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </a>
        </div>
    );
}
