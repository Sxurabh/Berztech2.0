import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function useTaskComments(taskId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabaseRef = useRef(null);

    // Initialize supabase client once
    if (!supabaseRef.current) {
        supabaseRef.current = createClient();
    }

    // Direct fetch from Supabase client (skips API route for blazing speed)
    const fetchComments = useCallback(async () => {
        if (!taskId || !supabaseRef.current) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabaseRef.current
                .from("task_comments")
                .select("*")
                .eq("task_id", taskId)
                .order("created_at", { ascending: true });

            if (!error && data) {
                setComments(data);
            }
        } catch (err) {
            console.error("Failed to load comments:", err);
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        if (!taskId) {
            setComments([]);
            setLoading(false);
            return;
        }
        fetchComments();

        // Polling fallback — ensures messages appear even if Realtime fails
        const pollInterval = setInterval(fetchComments, 5000);
        return () => clearInterval(pollInterval);
    }, [taskId, fetchComments]);

    // Realtime subscription for comments
    useEffect(() => {
        if (!supabaseRef.current || !taskId) return;

        const channel = supabaseRef.current
            .channel(`comments-${taskId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` },
                (payload) => {
                    setComments(prev => {
                        if (prev.some(c => c.id === payload.new.id)) return prev;
                        return [...prev, payload.new];
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'task_comments', filter: `task_id=eq.${taskId}` },
                (payload) => {
                    setComments(prev => prev.filter(c => c.id !== payload.old.id));
                }
            )
            .subscribe();

        return () => {
            supabaseRef.current.removeChannel(channel);
        };
    }, [taskId]);

    // Optimistic send — instant UI update, API call in background for notifications
    const sendComment = useCallback(async (content) => {
        if (!content?.trim() || !taskId) return false;

        // Get current user for optimistic update
        const { data: { user } } = await supabaseRef.current.auth.getUser();
        if (!user) return false;

        const optimisticComment = {
            id: crypto.randomUUID(),
            task_id: taskId,
            user_id: user.id,
            content: content.trim(),
            created_at: new Date().toISOString(),
            _optimistic: true,
        };

        // Instant UI update
        setComments(prev => [...prev, optimisticComment]);

        try {
            // Use API route for POST (handles auth + notification creation)
            const res = await fetch(`/api/tasks/${taskId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: content.trim() }),
            });

            if (res.ok) {
                const json = await res.json();
                // Replace optimistic comment with real data
                setComments(prev =>
                    prev.map(c =>
                        c.id === optimisticComment.id ? json.data : c
                    )
                );
                return true;
            } else {
                // Rollback optimistic update
                setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
                return false;
            }
        } catch (err) {
            // Rollback on error
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
            return false;
        }
    }, [taskId]);

    return { comments, setComments, loading, sendComment };
}
