import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

function formatLastSeen(dateString) {
    if (!dateString) return "Unknown";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 30) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay}d ago`;
    
    return date.toLocaleDateString();
}

export function useMyPresence() {
    const [presence, setPresence] = useState({
        isOnline: false,
        lastSeen: null,
        formattedStatus: "Unknown",
    });
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const supabase = createClient();
    const isInitialized = useRef(false);
    const intervalRef = useRef(null);

    console.log("[USE_MY_PRESENCE] Hook initialized, currentUserId:", currentUserId);

    // Get current user on mount
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            console.log("[USE_MY_PRESENCE] Got current user:", user?.id);
            setCurrentUserId(user?.id || null);
            isInitialized.current = true;
            setLoading(false);
        };
        getCurrentUser();
    }, []);

    // Update presence in database
    const updateMyPresence = useCallback(async (isOnline) => {
        if (!currentUserId) {
            console.log("[USE_MY_PRESENCE] No currentUserId, skipping update");
            return;
        }
        
        console.log("[USE_MY_PRESENCE] Updating my presence to:", isOnline);
        
        try {
            const res = await fetch("/api/users/presence", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_online: isOnline }),
            });
            
            const json = await res.json();
            console.log("[USE_MY_PRESENCE] PATCH response:", res.status, json);
            
            if (!res.ok) {
                console.error("[USE_MY_PRESENCE] Failed to update presence:", res.status, json);
            } else {
                // Update local state immediately for responsive UI
                setPresence({
                    isOnline,
                    lastSeen: isOnline ? new Date().toISOString() : presence.lastSeen,
                    formattedStatus: isOnline ? "Online" : formatLastSeen(presence.lastSeen),
                });
            }
        } catch (error) {
            console.error("[USE_MY_PRESENCE] Presence update error:", error);
        }
    }, [currentUserId]);

    // Fetch initial presence and subscribe to realtime
    useEffect(() => {
        if (!currentUserId || !isInitialized.current) return;

        console.log("[USE_MY_PRESENCE] Setting up presence tracking for:", currentUserId);
        
        // Set as online on mount
        updateMyPresence(true);

        // Fetch current presence
        const fetchPresence = async () => {
            try {
                const res = await fetch(`/api/users/presence?user_id=${currentUserId}`);
                const json = await res.json();
                console.log("[USE_MY_PRESENCE] GET response:", res.status, json);
                
                if (json.data) {
                    setPresence({
                        isOnline: json.data.is_online || false,
                        lastSeen: json.data.last_seen,
                        formattedStatus: json.data.is_online ? "Online" : formatLastSeen(json.data.last_seen),
                    });
                }
            } catch (error) {
                console.error("[USE_MY_PRESENCE] Fetch error:", error);
            }
        };
        
        fetchPresence();

        // Visibility change handler - when tab becomes hidden
        const handleVisibilityChange = () => {
            console.log("[USE_MY_PRESENCE] Visibility changed, hidden:", document.hidden);
            if (document.hidden) {
                updateMyPresence(false);
            } else {
                updateMyPresence(true);
            }
        };

        // Pagehide handler - more reliable than beforeunload for browser close
        const handlePageHide = (event) => {
            console.log("[USE_MY_PRESENCE] Page hiding/closing, using sendBeacon");
            
            // Use sendBeacon for more reliable delivery when closing browser
            if (currentUserId && navigator.sendBeacon) {
                const data = JSON.stringify({ user_id: currentUserId, is_online: false });
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon('/api/users/presence', blob);
                console.log("[USE_MY_PRESENCE] sendBeacon sent for offline, user_id:", currentUserId);
            }
        };

        // Realtime subscription for my own presence changes
        const channel = supabase
            .channel(`my-presence:${currentUserId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "user_presence",
                    filter: `user_id=eq.${currentUserId}`,
                },
                (payload) => {
                    console.log("[USE_MY_PRESENCE] Realtime update:", payload);
                    const newData = payload.new || payload.old;
                    if (newData) {
                        setPresence({
                            isOnline: newData.is_online || false,
                            lastSeen: newData.last_seen,
                            formattedStatus: newData.is_online ? "Online" : formatLastSeen(newData.last_seen),
                        });
                    }
                }
            )
            .subscribe();

        // Auto-refresh every 30 seconds as backup
        intervalRef.current = setInterval(() => {
            fetchPresence();
        }, 30000);

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("pagehide", handlePageHide);

        return () => {
            console.log("[USE_MY_PRESENCE] Cleanup, setting offline");
            updateMyPresence(false);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("pagehide", handlePageHide);
            supabase.removeChannel(channel);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [currentUserId, updateMyPresence]);

    return {
        ...presence,
        loading,
        formattedLastSeen: presence.formattedStatus,
    };
}
