import { useState, useEffect, useCallback } from "react";
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

export function useUserPresence(userId) {
    const [presence, setPresence] = useState({
        isOnline: false,
        lastSeen: null,
        formattedStatus: "Unknown",
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    console.log("[USE_PRESENCE] Hook called with userId:", userId);

    const updatePresence = useCallback(async (isOnline) => {
        if (!userId) {
            console.log("[USE_PRESENCE] No userId, skipping update");
            return;
        }
        
        console.log("[USE_PRESENCE] Updating presence:", isOnline);
        
        try {
            const res = await fetch("/api/users/presence", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_online: isOnline }),
            });
            
            const json = await res.json();
            console.log("[USE_PRESENCE] PATCH response:", res.status, json);
            
            if (!res.ok) {
                console.error("[USE_PRESENCE] Failed to update presence:", res.status, json);
            }
        } catch (error) {
            console.error("[USE_PRESENCE] Presence update error:", error);
        }
    }, [userId]);

    const fetchPresence = useCallback(async () => {
        if (!userId) {
            console.log("[USE_PRESENCE] No userId to fetch");
            setLoading(false);
            return;
        }

        console.log("[USE_PRESENCE] Fetching presence for:", userId);

        try {
            const res = await fetch(`/api/users/presence?user_id=${userId}`);
            const json = await res.json();
            console.log("[USE_PRESENCE] GET response:", res.status, json);
            
            if (json.data) {
                const isOnline = json.data.is_online || false;
                const lastSeen = json.data.last_seen;
                
                console.log("[USE_PRESENCE] Setting presence:", { isOnline, lastSeen });
                
                setPresence({
                    isOnline,
                    lastSeen,
                    formattedStatus: isOnline ? "Online" : formatLastSeen(lastSeen),
                });
            } else {
                console.log("[USE_PRESENCE] No data in response, using default");
            }
        } catch (error) {
            console.error("[USE_PRESENCE] Failed to fetch presence:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchPresence();
    }, [fetchPresence]);

    useEffect(() => {
        if (!userId) return;

        console.log("[USE_PRESENCE] Setting up presence tracking for:", userId);
        
        // Update to online on mount
        updatePresence(true);

        const handleVisibilityChange = () => {
            if (document.hidden) {
                updatePresence(false);
            } else {
                updatePresence(true);
            }
        };

        const handleBeforeUnload = () => {
            updatePresence(false);
        };

        const channel = supabase
            .channel(`presence:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "user_presence",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log("[USE_PRESENCE] Realtime update:", payload);
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

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            console.log("[USE_PRESENCE] Cleanup, setting offline");
            updatePresence(false);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            supabase.removeChannel(channel);
        };
    }, [userId, supabase, updatePresence]);

    return {
        ...presence,
        loading,
        formattedLastSeen: presence.formattedStatus,
    };
}

export function useProjectParticipants(projectId, currentUserId) {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!projectId) return;

        const fetchParticipants = async () => {
            try {
                const res = await fetch(`/api/projects/${projectId}/participants`);
                const json = await res.json();
                
                if (json.participants) {
                    setParticipants(json.participants.filter(p => p.id !== currentUserId));
                }
            } catch (error) {
                console.error("Failed to fetch participants:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();

        const channel = supabase
            .channel(`project-participants:${projectId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "user_presence",
                },
                () => {
                    fetchParticipants();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId, currentUserId, supabase]);

    return { participants, loading };
}
