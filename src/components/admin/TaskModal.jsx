"use client";

import { useState, useEffect, useRef } from "react";
import { FiX, FiCheck, FiTrash2, FiMessageSquare, FiArchive, FiSend } from "react-icons/fi";
import { COLUMNS } from "./KanbanBoard";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function TaskModal({ task, requestId, onClose, onUpdate, onDelete }) {
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const [status, setStatus] = useState(task?.status || "backlog");
    const [priority, setPriority] = useState(task?.priority || "medium");
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState("details");
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const isNew = !task;

    useEffect(() => {
        if (!isNew && activeTab === "comments") {
            fetchComments();
        }
    }, [task, activeTab, isNew]);

    async function fetchComments() {
        if (!task?.id) return;
        try {
            const res = await fetch(`/api/tasks/${task.id}/comments`);
            if (res.ok) {
                const json = await res.json();
                setComments(json.data || []);
            }
        } catch (error) {
            console.error("Failed to load comments", error);
        }
    }

    // Realtime subscription for comments
    useEffect(() => {
        const supabase = createClient();
        if (!supabase || !task?.id) return;

        const channel = supabase
            .channel(`comments-admin-${task.id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${task.id}` },
                (payload) => {
                    setComments(prev => {
                        if (prev.some(c => c.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'task_comments', filter: `task_id=eq.${task.id}` },
                (payload) => {
                    setComments(prev => prev.filter(c => c.id !== payload.old.id));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [task?.id]);

    // Auto-scroll to bottom when comments change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments]);

    // Date label helper
    const getDateLabel = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        setLoading(true);
        try {
            const url = isNew ? "/api/admin/tasks" : `/api/admin/tasks/${task.id}`;
            const method = isNew ? "POST" : "PATCH";

            const cleanRequestId = (requestId && requestId !== "undefined") ? requestId : null;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    status,
                    priority,
                    request_id: cleanRequestId,
                })
            });

            const json = await res.json();
            if (res.ok) {
                toast.success(isNew ? "Task created" : "Task updated");
                onUpdate(isNew ? null : task.id, json.data); // Replace/add in parent state
            } else {
                toast.error(json.error || "Failed to save task");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tasks/${task.id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Task deleted");
                onDelete(task.id);
            } else {
                const json = await res.json();
                toast.error(json.error || "Failed to delete");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!confirm("Are you sure you want to archive this task?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "archived" })
            });
            if (res.ok) {
                toast.success("Task archived");
                onDelete(task.id); // Remove from board view
            } else {
                const json = await res.json();
                toast.error(json.error || "Failed to archive");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
            onClose();
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

    const handleCommentKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            postComment();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-sm sm:p-6">
            <div className="w-full max-w-2xl bg-white border border-neutral-200 shadow-2xl rounded-sm flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
                    <h2 className="text-xl font-space-grotesk font-medium text-neutral-900 tracking-tight">
                        {isNew ? "New Task" : "Edit Task"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                {!isNew && (
                    <div className="flex border-b border-neutral-100 font-jetbrains-mono text-xs uppercase tracking-widest font-medium">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`flex-1 py-3 text-center transition-colors relative ${activeTab === "details" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"}`}
                        >
                            Details
                            {activeTab === "details" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("comments")}
                            className={`flex flex-1 items-center justify-center gap-2 py-3 transition-colors relative ${activeTab === "comments" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"}`}
                        >
                            <FiMessageSquare className="w-4 h-4" />
                            Comments ({task?.task_comments?.[0]?.count || comments.length})
                            {activeTab === "comments" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
                        </button>
                    </div>
                )}

                {/* Content area */}
                <div className={`flex-1 ${activeTab === 'details' ? 'overflow-y-auto p-4 sm:p-6' : 'flex flex-col min-h-0 overflow-hidden'}`}>
                    {activeTab === "details" ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all font-space-grotesk font-medium rounded-sm shadow-sm"
                                    placeholder="Task Title"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all font-space-grotesk rounded-sm shadow-sm"
                                    >
                                        {COLUMNS.map(col => (
                                            <option key={col.id} value={col.id}>{col.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
                                        Priority
                                    </label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all font-space-grotesk rounded-sm shadow-sm"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-jetbrains-mono font-medium text-neutral-500 uppercase tracking-widest mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 outline-none transition-all font-space-grotesk resize-y min-h-[100px] rounded-sm shadow-sm"
                                    placeholder="Add more details about this task..."
                                />
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
                                    </div>
                                ) : (
                                    <>
                                        {comments.map((c, idx) => {
                                            const isAdmin = c.user_id !== task?.client_id;
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
                                                    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                        <div className="max-w-[80%]">
                                                            <div className={`px-4 py-2.5 ${isAdmin
                                                                ? 'bg-neutral-900 text-white rounded-t-lg rounded-bl-lg'
                                                                : 'bg-neutral-100 text-neutral-900 border border-neutral-200 rounded-t-lg rounded-br-lg'
                                                                }`}>
                                                                <p className="text-sm font-space-grotesk whitespace-pre-wrap leading-relaxed">
                                                                    {c.content}
                                                                </p>
                                                            </div>
                                                            <div className={`flex items-center gap-2 mt-1 px-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                                <span className="text-[10px] font-jetbrains-mono font-bold text-neutral-400 uppercase tracking-widest">
                                                                    {isAdmin ? 'You' : 'Client'}
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
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Type a message..."
                                        rows={1}
                                        className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-0 outline-none transition-colors font-space-grotesk text-sm rounded-lg resize-none max-h-24 overflow-y-auto"
                                        onKeyDown={handleCommentKeyDown}
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

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-5 border-t border-neutral-100 bg-neutral-50/50">
                    {!isNew ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleArchive}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:border-neutral-400 rounded-sm transition-all shadow-sm"
                                title="Move task out of board"
                            >
                                <FiArchive className="w-4 h-4" />
                                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium">Archive</span>
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:text-white hover:bg-rose-600 border border-transparent hover:border-rose-600 rounded-sm transition-colors"
                            >
                                <FiTrash2 className="w-4 h-4" />
                                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium">Delete</span>
                            </button>
                        </div>
                    ) : <div />}

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 hover:bg-white rounded-sm transition-colors text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-sm shadow-sm transition-colors text-[10px] font-jetbrains-mono uppercase tracking-widest font-medium flex items-center gap-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FiCheck className="w-4 h-4" />
                            )}
                            {isNew ? "Create Task" : "Save Changes"}
                        </button>
                    </div>
                </div>

            </div>
        </div >
    );
}
