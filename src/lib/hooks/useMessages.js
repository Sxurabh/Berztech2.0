import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef } from "react";

export function useMessages(projectId) {
    const queryClient = useQueryClient();
    const supabase = createClient();
    const channelRef = useRef(null);

    const query = useQuery({
        queryKey: ["messages", projectId],
        queryFn: async () => {
            if (!projectId) return [];
            console.log("[USE_MESSAGES] Fetching messages for projectId:", projectId);
            const res = await fetch(`/api/messages?project_id=${projectId}`);
            if (!res.ok) {
                console.error("[USE_MESSAGES] Fetch error:", res.status, res.statusText);
                throw new Error("Failed to fetch messages");
            }
            const json = await res.json();
            console.log("[USE_MESSAGES] Got", json.data?.length || 0, "messages");
            return json.data || [];
        },
        enabled: !!projectId,
    });

    const sendMessage = useMutation({
        mutationFn: async (message) => {
            console.log("[USE_MESSAGES] Sending message:", message);
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...message, project_id: projectId }),
            });
            if (!res.ok) {
                const json = await res.json();
                console.error("[USE_MESSAGES] Send error:", json);
                throw new Error(json.error || "Failed to send message");
            }
            return res.json();
        },
        onSuccess: () => {
            console.log("[USE_MESSAGES] Message sent successfully");
            queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
        },
    });

    const markAsRead = useMutation({
        mutationFn: async (messageId) => {
            console.log("[USE_MESSAGES] Marking as read, messageId:", messageId);
            const res = await fetch(`/api/messages/${messageId}/read`, {
                method: "PATCH",
            });
            if (!res.ok) {
                const json = await res.json();
                console.error("[USE_MESSAGES] Mark as read error:", res.status, json);
                throw new Error("Failed to mark as read");
            }
            console.log("[USE_MESSAGES] Marked as read successfully");
            return res.json();
        },
        onSuccess: () => {
            console.log("[USE_MESSAGES] Read receipt updated");
            queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
        },
    });

    useEffect(() => {
        if (!projectId || !supabase) return;

        console.log("[USE_MESSAGES] Setting up realtime for projectId:", projectId);

        channelRef.current = supabase
            .channel(`messages:${projectId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "project_messages",
                    filter: `project_id=eq.${projectId}`,
                },
                (payload) => {
                    console.log("[USE_MESSAGES] New message via realtime:", payload.new);
                    queryClient.setQueryData(["messages", projectId], (old) => {
                        if (!old) return [payload.new];
                        if (old.some((m) => m.id === payload.new.id)) return old;
                        return [...old, payload.new];
                    });
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "message_reads",
                },
                (payload) => {
                    console.log("[USE_MESSAGES] New read receipt via realtime:", payload.new);
                    queryClient.setQueryData(["messages", projectId], (old) => {
                        if (!old) return old;
                        return old.map((msg) => {
                            if (msg.id === payload.new.message_id) {
                                return {
                                    ...msg,
                                    reads: [...(msg.reads || []), payload.new],
                                };
                            }
                            return msg;
                        });
                    });
                }
            )
            .subscribe();

        console.log("[USE_MESSAGES] Realtime subscribed");
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [projectId, queryClient, supabase]);

    return {
        messages: query.data || [],
        loading: query.isLoading,
        error: query.error,
        sendMessage: sendMessage.mutateAsync,
        markAsRead: markAsRead.mutateAsync,
        isSending: sendMessage.isPending,
    };
}

export function useUploadMessageAttachment() {
    const upload = async (file, projectId) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("project_id", projectId);

        const res = await fetch("/api/messages/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || "Failed to upload file");
        }

        return res.json();
    };

    return { upload };
}
