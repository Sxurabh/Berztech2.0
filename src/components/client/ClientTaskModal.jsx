"use client";

import { useState, useEffect, useRef } from "react";
import { FiX, FiMessageSquare, FiArrowUp, FiArrowRight, FiArrowDown, FiSend } from "react-icons/fi";
import { COLUMNS } from "./ClientKanbanBoard";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const PRIORITY_COLORS = {
    low: "bg-neutral-50 text-neutral-600 border-neutral-200",
    medium: "bg-blue-50/50 text-blue-700 border-blue-200",
    high: "bg-rose-50/50 text-rose-700 border-rose-200"
};

const PRIORITY_ICONS = {
    low: <FiArrowDown className="w-3 h-3" />,
    medium: <FiArrowRight className="w-3 h-3" />,
    high: <FiArrowUp className="w-3 h-3" />
};

export default function ClientTaskModal({ task, onClose }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState("comments");
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [task.id]);

    // Realtime subscription for comments
    useEffect(() => {
        const supabase = createClient();
        if (!supabase || !task.id) return;

        const channel = supabase
            .channel(`comments-client-${task.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'task_comments',
                    filter: `task_id=eq.${task.id}`,
                },
                (payload) => {
                    setComments(prev => {
                        // Avoid duplicates (from optimistic add)
                        if (prev.some(c => c.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'task_comments',
                    filter: `task_id=eq.${task.id}`,
                },
                (payload) => {
                    setComments(prev => prev.filter(c => c.id !== payload.old.id));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [task.id]);

    // Auto-scroll to bottom when comments change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/tasks/${task.id}/comments`);
            const json = await res.json();
            if (res.ok) setComments(json.data);
            else toast.error(json.error || "Failed to load comments");
        } catch (error) {
            toast.error("Error fetching comments");
        }
    };

    const postComment = async () => {
        if (!newComment.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch(`/api/tasks/${task.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment })
            });
            const json = await res.json();
            if (res.ok) {
                // Optimistic add (Realtime will skip dupes)
                setComments(prev => {
                    if (prev.some(c => c.id === json.data.id)) return prev;
                    return [...prev, json.data];
                });
                setNewComment("");
            } else {
                toast.error(json.error || "Failed to post comment");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            postComment();
        }
    };

    // Group messages by date for date separators
    const getDateLabel = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm sm:p-6">
            <div className="w-full max-w-2xl bg-white border border-neutral-200 shadow-xl flex flex-col max-h-[90vh] rounded-sm relative overflow-hidden">
                {/* Visual Corner Brackets */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neutral-400 pointer-events-none" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neutral-400 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neutral-400 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neutral-400 pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-neutral-100">
                    <h2 className="text-lg sm:text-xl font-space-grotesk font-semibold text-neutral-900 line-clamp-1 pr-4">
                        {task.title}
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close task details"
                        className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shrink-0 rounded-sm"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-100 font-jetbrains-mono text-[10px] sm:text-xs">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`flex-1 py-2.5 sm:py-3 text-center uppercase tracking-widest transition-colors ${activeTab === "details" ? "border-b-2 border-neutral-900 text-neutral-900 font-bold" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("comments")}
                        className={`flex flex-1 items-center justify-center gap-2 py-3 uppercase tracking-widest transition-colors ${activeTab === "comments" ? "border-b-2 border-neutral-900 text-neutral-900 font-bold" : "text-neutral-500 hover:text-neutral-800"}`}
                    >
                        <FiMessageSquare className="w-3.5 h-3.5" />
                        Feedback ({comments.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === "details" ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                        <div className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">
                                        Current Status
                                    </label>
                                    <div className="px-4 py-2.5 bg-neutral-50 border border-neutral-100 font-space-grotesk font-medium text-neutral-900 rounded-sm">
                                        {COLUMNS.find(c => c.id === task.status)?.title || task.status}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">
                                        Priority
                                    </label>
                                    <div className="px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-sm flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium rounded-sm border flex items-center gap-1 ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                                            {PRIORITY_ICONS[task.priority] || PRIORITY_ICONS.medium}
                                            {task.priority || "Medium"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {task.created_at && (
                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">
                                        Created
                                    </label>
                                    <div className="px-4 py-2.5 bg-neutral-50 border border-neutral-100 font-jetbrains-mono text-sm text-neutral-700 rounded-sm">
                                        {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-jetbrains-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">
                                    Description
                                </label>
                                <div className="px-4 py-3 bg-neutral-50 border border-neutral-100 font-space-grotesk text-neutral-700 whitespace-pre-wrap min-h-[100px] text-sm rounded-sm">
                                    {task.description || "No description provided."}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ============ CHAT WINDOW ============ */
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* Scrollable chat area — fixed height */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3"
                            style={{ maxHeight: 'clamp(200px, 50vh, 400px)', minHeight: '180px' }}
                        >
                            {comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-12">
                                    <FiMessageSquare className="w-8 h-8 mb-3 opacity-30" />
                                    <p className="font-jetbrains-mono text-xs uppercase tracking-widest">No messages yet</p>
                                    <p className="font-space-grotesk text-sm mt-1">Start the conversation!</p>
                                </div>
                            ) : (
                                <>
                                    {comments.map((c, idx) => {
                                        const isMe = c.user_id === task.client_id;
                                        // Date separator
                                        const showDateSep = idx === 0 ||
                                            getDateLabel(c.created_at) !== getDateLabel(comments[idx - 1].created_at);

                                        return (
                                            <div key={c.id}>
                                                {showDateSep && (
                                                    <div className="flex items-center gap-3 my-4">
                                                        <div className="flex-1 h-px bg-neutral-200" />
                                                        <span className="text-[10px] font-jetbrains-mono text-neutral-400 uppercase tracking-widest">
                                                            {getDateLabel(c.created_at)}
                                                        </span>
                                                        <div className="flex-1 h-px bg-neutral-200" />
                                                    </div>
                                                )}
                                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className="max-w-[80%]">
                                                        <div className={`px-4 py-2.5 ${isMe
                                                            ? 'bg-neutral-900 text-white rounded-t-lg rounded-bl-lg'
                                                            : 'bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-t-lg rounded-br-lg'
                                                            }`}>
                                                            <p className="text-sm font-space-grotesk whitespace-pre-wrap leading-relaxed">
                                                                {c.content}
                                                            </p>
                                                        </div>
                                                        <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <span className="text-[10px] font-jetbrains-mono font-bold text-neutral-400 uppercase tracking-widest">
                                                                {isMe ? 'You' : 'Berztech'}
                                                            </span>
                                                            <span className="text-[10px] font-jetbrains-mono text-neutral-300">
                                                                {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </>
                            )}
                        </div>

                        {/* Chat Input */}
                        <div className="border-t border-neutral-200 bg-neutral-50/80 p-3 sm:p-4">
                            <div className="flex items-end gap-2">
                                <label htmlFor="client-comment-input" className="sr-only">Type your message</label>
                                <textarea
                                    id="client-comment-input"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Type a message..."
                                    rows={1}
                                    className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors font-space-grotesk text-sm rounded-lg resize-none max-h-24 overflow-y-auto"
                                    onKeyDown={handleKeyDown}
                                    style={{ minHeight: '42px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                                    }}
                                />
                                <button
                                    onClick={postComment}
                                    disabled={!newComment.trim() || sending}
                                    aria-label="Send message"
                                    className="p-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
                                >
                                    {sending ? (
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                                    ) : (
                                        <FiSend className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
