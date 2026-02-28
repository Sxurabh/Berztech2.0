"use client";

import { useState, useEffect, useRef } from "react";
import { FiX, FiCheck, FiTrash2, FiMessageSquare, FiArchive, FiSend } from "react-icons/fi";
import { COLUMNS } from "./KanbanBoard";
import { toast } from "react-hot-toast";
import TaskModalDetails from "./TaskModalDetails";
import TaskModalChat from "./TaskModalChat";
import TaskModalHeader from "./TaskModalHeader";
import TaskModalFooter from "./TaskModalFooter";
import { useTaskComments } from "@/lib/hooks/useTaskComments";

export default function TaskModal({ task, requestId, onClose, onUpdate, onDelete }) {
    const isNew = !task?.id;
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const [status, setStatus] = useState(task?.status || "backlog");
    const [priority, setPriority] = useState(task?.priority || "medium");
    const [activeTab, setActiveTab] = useState("details");
    const { comments, setComments, sendComment } = useTaskComments(task?.id);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);

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
        const content = newComment;
        setNewComment(""); // Clear input immediately for instant feel
        const success = await sendComment(content);
        if (!success) {
            toast.error("Failed to post comment");
            setNewComment(content); // Restore on failure
        }
        setSending(false);
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
                <TaskModalHeader isNew={isNew} onClose={onClose} />

                {/* Tabs */}
                {!isNew && (
                    <div className="flex border-b border-neutral-100 font-jetbrains-mono text-[10px] sm:text-xs uppercase tracking-widest font-medium">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`flex-1 py-2.5 sm:py-3 text-center transition-colors relative ${activeTab === "details" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"}`}
                        >
                            Details
                            {activeTab === "details" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("comments")}
                            className={`flex flex-1 items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 transition-colors relative ${activeTab === "comments" ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"}`}
                        >
                            <FiMessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Comments ({task?.task_comments?.[0]?.count || comments.length})
                            {activeTab === "comments" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
                        </button>
                    </div>
                )}

                {/* Content area */}
                <div className={`flex-1 ${activeTab === 'details' ? 'overflow-y-auto p-4 sm:p-6' : 'flex flex-col min-h-0 overflow-hidden'}`}>
                    {activeTab === "details" ? (
                        <TaskModalDetails
                            title={title} setTitle={setTitle}
                            description={description} setDescription={setDescription}
                            status={status} setStatus={setStatus}
                            priority={priority} setPriority={setPriority}
                        />
                    ) : (
                        /* ============ CHAT WINDOW ============ */
                        <TaskModalChat
                            task={task}
                            comments={comments}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            postComment={postComment}
                            sending={sending}
                            handleCommentKeyDown={handleCommentKeyDown}
                            chatContainerRef={chatContainerRef}
                            chatEndRef={chatEndRef}
                        />
                    )}
                </div>

                {/* Footer Actions */}
                {/* Footer Actions */}
                <TaskModalFooter
                    isNew={isNew}
                    loading={loading}
                    onClose={onClose}
                    handleSave={handleSave}
                    handleArchive={handleArchive}
                    handleDelete={handleDelete}
                />

            </div>
        </div >
    );
}
