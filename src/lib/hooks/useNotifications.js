import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

export function useNotifications() {
    const { user } = useAuth();
    const [rawNotifications, setRawNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Client-side filter: hide read notifications older than 3 hours
    const THREE_HOURS = 3 * 60 * 60 * 1000;
    const notifications = rawNotifications.filter(n => {
        if (!n.is_read) return true;
        return (Date.now() - new Date(n.created_at).getTime()) < THREE_HOURS;
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const json = await res.json();
                setRawNotifications(json.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch + polling fallback
    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 30s as Realtime backup
            const pollInterval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(pollInterval);
        } else {
            setRawNotifications([]);
            setLoading(false);
        }
    }, [user, fetchNotifications]);

    // Realtime subscription
    useEffect(() => {
        const supabase = createClient();
        if (!supabase || !user) return;

        const channel = supabase
            .channel(`notifications-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setRawNotifications((prev) => {
                        if (prev.some((n) => n.id === payload.new.id)) return prev;
                        return [payload.new, ...prev];
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setRawNotifications((prev) =>
                        prev.map((n) =>
                            n.id === payload.new.id ? { ...n, ...payload.new } : n
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const markAsRead = useCallback(async (id) => {
        // Optimistic update
        setRawNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        try {
            await fetch("/api/notifications/read", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        // Optimistic update
        setRawNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        try {
            await fetch("/api/notifications/read", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ all: true }),
            });
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    }, []);

    return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
