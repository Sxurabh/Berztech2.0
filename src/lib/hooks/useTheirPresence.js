import { useState, useEffect, useRef } from "react";
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

export function useTheirPresence(userId) {
    const [presence, setPresence] = useState({
        isOnline: false,
        lastSeen: null,
        formattedStatus: "Unknown",
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const intervalRef = useRef(null);

    console.log("[USE_THEIR_PRESENCE] Hook called with userId:", userId);

    useEffect(() => {
        if (!userId) {
            console.log("[USE_THEIR_PRESENCE] No userId, returning default");
            setLoading(false);
            return;
        }

        console.log("[USE_THEIR_PRESENCE] Setting up to track user:", userId);

        // Fetch their presence
        const fetchTheirPresence = async () => {
            try {
                const res = await fetch(`/api/users/presence?user_id=${userId}`);
                const json = await res.json();
                console.log("[USE_THEIR_PRESENCE] GET response:", res.status, json);
                
                if (json.data) {
                    const isOnline = json.data.is_online || false;
                    const lastSeen = json.data.last_seen;
                    
                    setPresence({
                        isOnline,
                        lastSeen,
                        formattedStatus: isOnline ? "Online" : formatLastSeen(lastSeen),
                    });
                }
            } catch (error) {
                console.error("[USE_THEIR_PRESENCE] Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTheirPresence();

        // Realtime subscription for their presence changes
        const channel = supabase
            .channel(`their-presence:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "user_presence",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log("[USE_THEIR_PRESENCE] Realtime update:", payload);
                    const newData = payload.new || payload.old;
                    if (newData) {
                        const isOnline = newData.is_online || false;
                        const lastSeen = newData.last_seen;
                        
                        setPresence({
                            isOnline,
                            lastSeen,
                            formattedStatus: isOnline ? "Online" : formatLastSeen(lastSeen),
                        });
                    }
                }
            )
            .subscribe();

        // Auto-refresh every 15 seconds as backup (faster for showing their status)
        intervalRef.current = setInterval(() => {
            fetchTheirPresence();
        }, 15000);

        return () => {
            console.log("[USE_THEIR_PRESENCE] Cleanup for user:", userId);
            supabase.removeChannel(channel);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [userId, supabase]);

    return {
        ...presence,
        loading,
        formattedLastSeen: presence.formattedStatus,
    };
}
