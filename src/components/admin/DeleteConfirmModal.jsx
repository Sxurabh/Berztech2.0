"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, loading }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-6"
                >
                    <h3 className="font-space-grotesk text-lg font-medium text-white mb-2">
                        Delete {itemName || "Item"}?
                    </h3>
                    <p className="text-sm text-neutral-400 mb-6">
                        This action cannot be undone. The {itemName?.toLowerCase() || "item"} will be permanently removed.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-400 hover:text-white border border-neutral-700 hover:border-neutral-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="px-4 py-2 text-xs font-jetbrains-mono uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
