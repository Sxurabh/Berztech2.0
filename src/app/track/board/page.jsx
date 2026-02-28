"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import ClientKanbanBoard from "@/components/client/ClientKanbanBoard";
import ClientTaskModal from "@/components/client/ClientTaskModal";
import { createClient } from "@/lib/supabase/client";

function ClientBoardContent() {
    const searchParams = useSearchParams();
    const requestId = searchParams.get("requestId");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalData, setModalData] = useState({ open: false, task: null });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!requestId) {
            setError("No specific request selected.");
            setLoading(false);
            return;
        }
        fetchBoardData();
    }, [requestId]);

    // Supabase Realtime: subscribe to task changes so admin updates appear instantly
    useEffect(() => {
        if (!requestId) return;

        const supabase = createClient();
        if (!supabase) return;

        const channel = supabase
            .channel(`client-board-${requestId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `request_id=eq.${requestId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTasks(prev => [...prev, payload.new]);
                    } else if (payload.eventType === 'UPDATE') {
                        setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t));
                        // Also update the modal if it's open for this task
                        setModalData(prev => {
                            if (prev.open && prev.task?.id === payload.new.id) {
                                return { ...prev, task: { ...prev.task, ...payload.new } };
                            }
                            return prev;
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
                        // Close modal if the deleted task was open
                        setModalData(prev => {
                            if (prev.open && prev.task?.id === payload.old.id) {
                                return { open: false, task: null };
                            }
                            return prev;
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [requestId]);

    async function fetchBoardData() {
        setLoading(true);
        try {
            const res = await fetch(`/api/client/tasks?requestId=${requestId}`);
            const json = await res.json();

            if (res.ok) {
                setTasks(json.data || []);
            } else {
                setError(json.error || "Access Denied. Please ensure you are logged in.");
                toast.error("Failed to load tasks");
            }
        } catch (error) {
            setError("Network error fetching board data. Ensure you are authenticated.");
            toast.error("Error fetching board data");
        } finally {
            setLoading(false);
        }
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-6">
                <div className="bg-rose-50 border-2 border-rose-200 p-8 text-center max-w-lg mx-auto">
                    <h2 className="text-xl font-space-grotesk font-bold text-rose-800 mb-2">Access Error</h2>
                    <p className="text-rose-600 font-jetbrains-mono text-sm">{error}</p>
                    <Link href="/track" className="inline-block mt-4 text-sm font-bold underline font-jetbrains-mono hover:text-rose-900">
                        Return to Active Requests
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] flex flex-col pt-4 md:overflow-hidden">
            {/* Header Area */}
            <div className="flex-shrink-0 mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 md:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <Link href="/track" className="inline-flex items-center gap-2 text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-bold mb-3 sm:mb-4 hover:text-neutral-900 transition-colors">
                            <FiArrowLeft className="w-3 h-3" /> Back to My Requests
                        </Link>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-space-grotesk font-medium text-neutral-900 tracking-tight">
                            Request Board
                        </h1>
                        <p className="text-xs sm:text-sm font-space-grotesk text-neutral-500 mt-1">
                            View task progress and provide feedback.
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full" />
                </div>
            ) : (
                <div className="flex-1 min-h-0 pb-6 px-4 sm:px-6 md:px-8 md:relative">
                    <div className="md:absolute md:inset-0 md:px-8">
                        <ClientKanbanBoard
                            tasks={tasks}
                            onTaskClick={(t) => setModalData({ open: true, task: t })}
                        />
                    </div>
                </div>
            )}

            {modalData.open && (
                <ClientTaskModal
                    task={modalData.task}
                    onClose={() => setModalData({ open: false, task: null })}
                />
            )}
        </div>
    );
}

export default function ClientBoardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full" />
            </div>
        }>
            <ClientBoardContent />
        </Suspense>
    );
}
