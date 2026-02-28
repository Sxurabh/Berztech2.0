"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { FiPlus, FiTrash2, FiMessageSquare, FiFilter } from "react-icons/fi";
import KanbanBoard from "@/components/admin/KanbanBoard";
import TaskModal from "@/components/admin/TaskModal";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function BoardContent() {
    const searchParams = useSearchParams();
    const requestId = searchParams.get("requestId");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState({ open: false, task: null });
    const [requests, setRequests] = useState([]);
    const [selectedRequestId, setSelectedRequestId] = useState(requestId || '');

    // Fetch requests for the filter dropdown (only when in global view)
    useEffect(() => {
        if (!requestId) {
            fetch('/api/admin/requests')
                .then(res => res.json())
                .then(data => {
                    if (data.data) setRequests(data.data);
                })
                .catch(() => { });
        }
    }, [requestId]);

    useEffect(() => {
        fetchBoardData();
    }, [requestId, selectedRequestId]);

    // Supabase Realtime: subscribe to task changes for live sync
    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;

        const activeRequestId = requestId || selectedRequestId;
        const filterConfig = activeRequestId
            ? { event: '*', schema: 'public', table: 'tasks', filter: `request_id=eq.${activeRequestId}` }
            : { event: '*', schema: 'public', table: 'tasks' };

        const channel = supabase
            .channel(`admin-board-${activeRequestId || 'all'}`)
            .on('postgres_changes', filterConfig, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTasks(prev => [...prev, payload.new]);
                } else if (payload.eventType === 'UPDATE') {
                    setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
                    setModalData(prev => {
                        if (prev.open && prev.task?.id === payload.new.id) {
                            return { ...prev, task: { ...prev.task, ...payload.new } };
                        }
                        return prev;
                    });
                } else if (payload.eventType === 'DELETE') {
                    setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                    setModalData(prev => {
                        if (prev.open && prev.task?.id === payload.old.id) {
                            return { open: false, task: null };
                        }
                        return prev;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [requestId, selectedRequestId]);

    async function fetchBoardData() {
        setLoading(true);
        try {
            const activeRequestId = requestId || selectedRequestId;
            const endpoint = activeRequestId
                ? `/api/admin/tasks?requestId=${activeRequestId}`
                : `/api/admin/tasks`;

            const resTasks = await fetch(endpoint);
            const jsonTasks = await resTasks.json();

            if (resTasks.ok) {
                setTasks(jsonTasks.data || []);
            } else {
                toast.error("Failed to load tasks");
            }

            // The following block is a duplicate and should be removed.
            // if (resTasks.ok) {
            //     setTasks(jsonTasks.data || []);
            // } else {
            //     toast.error("Failed to load tasks");
            // }
        } catch (error) {
            toast.error("Error fetching board data");
        } finally {
            setLoading(false);
        }
    }

    // Handles rapid movement changes (e.g. from dropdown logic inside KanbanCard over drag/drop)
    const handleTaskMove = async (taskId, newStatus) => {
        if (!taskId) {
            toast.error("Invalid task ID. Please refresh the page.");
            return;
        }

        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            const res = await fetch(`/api/admin/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                toast.error("Failed to move task");
                fetchBoardData();
            }
        } catch (error) {
            fetchBoardData();
        }
    };

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return; // Dropped outside the board

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return; // Didn't move
        }

        const task = tasks.find(t => t.id === draggableId);
        if (!task) return;

        const newStatus = destination.droppableId;

        // Grab all tasks in the dest column and sort them (excluding the dragged task temporarily if in same column)
        let destTasks = tasks.filter(t => t.status === newStatus).sort((a, b) => a.order_index - b.order_index);

        if (source.droppableId === destination.droppableId) {
            destTasks = destTasks.filter(t => t.id !== draggableId);
        }

        let newOrderIndex = 1024;

        if (destination.index === 0) {
            // First item
            newOrderIndex = destTasks.length > 0 ? destTasks[0].order_index / 2 : 1024;
        } else if (destination.index >= destTasks.length) {
            // Last item
            newOrderIndex = destTasks.length > 0 ? destTasks[destTasks.length - 1].order_index + 1024 : 1024;
        } else {
            // Middle
            const prev = destTasks[destination.index - 1].order_index;
            const next = destTasks[destination.index].order_index;
            newOrderIndex = (prev + next) / 2;
        }

        // Optimistic UI update
        setTasks(prev => prev.map(t => {
            if (t.id === draggableId) {
                return { ...t, status: newStatus, order_index: newOrderIndex };
            }
            return t;
        }));

        if (!task.id) {
            toast.error("Invalid task ID. Please refresh the page.");
            return;
        }

        try {
            const res = await fetch(`/api/admin/tasks/${task.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, order_index: newOrderIndex })
            });

            if (!res.ok) {
                toast.error("Failed to move task");
                fetchBoardData(); // Reset on fail
            }
        } catch (error) {
            fetchBoardData();
        }
    };

    const handleTaskDelete = (taskId) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setModalData({ open: false, task: null });
    };

    const handleTaskUpdate = (taskId, data) => {
        if (!taskId) {
            // New task
            setTasks([...tasks, data]);
        } else {
            // Update
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...data } : t));
        }
        setModalData({ open: false, task: null });
    };
    const filteredTasks = tasks;

    const activeRequestId = requestId || selectedRequestId;
    const isGlobalView = !requestId;

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col pt-4 overflow-hidden">
            {/* Header Area */}
            <div className="flex-shrink-0 mb-4 sm:mb-8 px-4 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-space-grotesk font-medium text-neutral-900 tracking-tight">
                            {requestId ? "Request Board" : "Global Board"}
                        </h1>
                        <p className="text-sm font-space-grotesk text-neutral-500 mt-1">
                            {requestId ? "Manage tasks for this specific request" : "Overview of all tasks across requests"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* Request Filter Dropdown — only shown in global view */}
                        {isGlobalView && (
                            <div className="relative flex items-center gap-2">
                                <FiFilter className="w-3.5 h-3.5 text-neutral-400" />
                                <select
                                    value={selectedRequestId}
                                    onChange={(e) => setSelectedRequestId(e.target.value)}
                                    aria-label="Filter by request"
                                    className="appearance-none bg-white border border-neutral-200 text-neutral-900 font-jetbrains-mono text-xs uppercase tracking-wider px-3 py-2 pr-8 rounded-sm shadow-sm hover:border-neutral-300 focus:border-neutral-900 focus:ring-0 outline-none transition-colors cursor-pointer min-w-[180px]"
                                >
                                    <option value="">All Requests</option>
                                    {requests.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.name || 'Unknown'}{r.service_type ? ` — ${r.service_type}` : ''}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom dropdown arrow */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setModalData({ open: true, task: null })}
                            className="px-6 py-2.5 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors rounded-sm shadow-sm"
                        >
                            Create Task
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full" />
                </div>
            ) : (
                <div className="flex-1 min-h-0 pb-6 relative">
                    <div className="absolute inset-0">
                        <KanbanBoard
                            tasks={filteredTasks}
                            onTaskMove={handleTaskMove}
                            onDragEnd={handleDragEnd}
                            onTaskClick={(t) => setModalData({ open: true, task: t })}
                            onNewTask={(status) => setModalData({ open: true, task: { status } })}
                        />
                    </div>
                </div>
            )}

            {modalData.open && (
                <TaskModal
                    task={modalData.task}
                    requestId={activeRequestId || undefined}
                    onClose={() => setModalData({ open: false, task: null })}
                    onDelete={handleTaskDelete}
                    onUpdate={handleTaskUpdate}
                />
            )}
        </div>
    );
}

export default function AdminBoardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
            </div>
        }>
            <BoardContent />
        </Suspense>
    );
}
