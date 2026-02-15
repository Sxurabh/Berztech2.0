"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, loading }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm"
                >
                    <CornerFrame
                        className="bg-white border-neutral-200 p-6"
                        bracketClassName="w-3 h-3 border-neutral-300"
                    >
                        <h3 className="font-space-grotesk text-lg font-medium text-neutral-900 mb-2">
                            Delete {itemName || "Item"}?
                        </h3>
                        <p className="text-sm text-neutral-600 mb-6">
                            This action cannot be undone. The {itemName?.toLowerCase() || "item"} will be permanently removed.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 transition-colors rounded-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="px-4 py-2 text-xs font-jetbrains-mono uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 rounded-sm"
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </CornerFrame>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}