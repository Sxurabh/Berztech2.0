"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

export default function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative bg-white border border-neutral-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8 sm:my-0 rounded-sm"
                >
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 shrink-0 bg-neutral-50/50">
                        <h2 className="font-space-grotesk text-base font-medium text-neutral-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors rounded-sm"
                            aria-label="Close"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-5 modal-scroll">
                        {children}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
