"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiMessageCircle, FiCheck, FiExternalLink } from "react-icons/fi";
import Link from "next/link";
import { useNotifications } from "@/lib/hooks/useNotifications";

function timeAgo(dateStr) {
    const now = new Date();
    const d = new Date(dateStr);
    const seconds = Math.floor((now - d) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function NotificationDropdown({ isAdmin = false }) {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        setIsOpen(false);
    };

    const getNotificationLink = (n) => {
        if (n.task_id && n.request_id) {
            return isAdmin
                ? `/admin/board?requestId=${n.request_id}`
                : `/track/board?requestId=${n.request_id}`;
        }
        return isAdmin ? "/admin" : "/dashboard";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-neutral-500 hover:text-neutral-900 transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
                aria-expanded={isOpen}
            >
                <FiBell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 bg-neutral-900 text-white text-[9px] font-jetbrains-mono font-bold rounded-full"
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-neutral-200 rounded-sm shadow-xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-medium">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1 text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
                                >
                                    <FiCheck className="w-3 h-3" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[360px] overflow-y-auto">
                            {loading ? (
                                <div className="px-4 py-8 text-center">
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-12 bg-neutral-100 rounded-sm" />
                                        <div className="h-12 bg-neutral-50 rounded-sm" />
                                        <div className="h-12 bg-neutral-50 rounded-sm" />
                                    </div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="px-4 py-10 text-center">
                                    <FiBell className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
                                    <p className="text-xs font-jetbrains-mono text-neutral-400 uppercase tracking-widest">
                                        No notifications yet
                                    </p>
                                </div>
                            ) : (
                                notifications.slice(0, 20).map((n) => (
                                    <Link
                                        key={n.id}
                                        href={getNotificationLink(n)}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`
                                            block px-4 py-3 border-b border-neutral-50 transition-colors hover:bg-neutral-50
                                            ${!n.is_read ? "bg-neutral-50/80" : ""}
                                        `}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon */}
                                            <div className={`
                                                mt-0.5 shrink-0 w-6 h-6 flex items-center justify-center rounded-full
                                                ${!n.is_read ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"}
                                            `}>
                                                <FiMessageCircle className="w-3 h-3" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`
                                                        text-xs font-space-grotesk truncate
                                                        ${!n.is_read ? "font-bold text-neutral-900" : "font-medium text-neutral-600"}
                                                    `}>
                                                        {n.title}
                                                    </p>
                                                    {!n.is_read && (
                                                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-neutral-900 mt-1" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] font-jetbrains-mono text-neutral-500 truncate mt-0.5">
                                                    {n.message}
                                                </p>
                                                <p className="text-[9px] font-jetbrains-mono text-neutral-400 uppercase tracking-widest mt-1">
                                                    {timeAgo(n.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50/50">
                                <p className="text-[9px] font-jetbrains-mono text-neutral-400 uppercase tracking-widest text-center">
                                    Showing last {Math.min(notifications.length, 20)} notifications
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
