import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const CreateMessageSchema = z.object({
    project_id: z.string().uuid("Invalid project ID"),
    content: z.string().min(1, "Message cannot be empty").max(5000, "Message too long"),
    task_id: z.string().uuid().optional().nullable(),
    attachment_url: z.string().url().optional().nullable(),
    attachment_type: z.enum(["image", "document"]).optional().nullable(),
    attachment_name: z.string().max(255).optional().nullable(),
});

export async function GET(request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("project_id");
        const limit = parseInt(searchParams.get("limit") || "50");
        const before = searchParams.get("before");

        console.log("[GET_MESSAGES] projectId:", projectId, "limit:", limit);

        if (!projectId) {
            return NextResponse.json({ error: "project_id is required" }, { status: 400 });
        }

        const { data: { user } } = await supabase.auth.getUser();
        console.log("[GET_MESSAGES] Auth user:", user?.id, user?.email);
        
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let query = supabase
            .from("project_messages")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: true })
            .limit(limit);

        if (before) {
            query = query.lt("created_at", before);
        }

        const { data: messages, error } = await query;

        console.log("[GET_MESSAGES] Raw messages count:", messages?.length || 0, "Error:", error);

        if (error) {
            console.error("[GET_MESSAGES] Database error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        if (!messages || messages.length === 0) {
            console.log("[GET_MESSAGES] No messages found for project:", projectId);
            return NextResponse.json({ data: [] }, { status: 200 });
        }

        const messageIds = messages.map(m => m.id);
        console.log("[GET_MESSAGES] Message IDs:", messageIds);

        const { data: reads } = await supabase
            .from("message_reads")
            .select("*")
            .in("message_id", messageIds);

        console.log("[GET_MESSAGES] Reads count:", reads?.length || 0);

        const readsMap = {};
        reads?.forEach(r => {
            if (!readsMap[r.message_id]) readsMap[r.message_id] = [];
            readsMap[r.message_id].push(r);
        });

        const senderIds = [...new Set(messages.map(m => m.sender_id))];
        console.log("[GET_MESSAGES] Sender IDs:", senderIds);

        const { data: profiles } = await supabase
            .from("user_profiles")
            .select("id, full_name, avatar_url")
            .in("id", senderIds);

        const profilesMap = {};
        profiles?.forEach(p => {
            profilesMap[p.id] = p;
        });

        console.log("[GET_MESSAGES] Profiles map:", profilesMap);

        const messagesWithReads = messages.map(msg => {
            const sender = profilesMap[msg.sender_id];
            const formatted = {
                ...msg,
                reads: readsMap[msg.id] || [],
                sender: sender ? {
                    id: sender.id,
                    full_name: sender.full_name || msg.sender_name,
                    avatar_url: sender.avatar_url
                } : {
                    id: msg.sender_id,
                    full_name: msg.sender_name,
                    avatar_url: null
                }
            };
            console.log("[GET_MESSAGES] Message", msg.id, "sender:", formatted.sender);
            return formatted;
        });

        console.log("[GET_MESSAGES] Returning", messagesWithReads.length, "messages");
        return NextResponse.json({ data: messagesWithReads }, { status: 200 });
    } catch (error) {
        console.error("[GET_MESSAGES] GET /api/messages error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const validation = CreateMessageSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.format() },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const senderName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

        const { data: message, error } = await supabase
            .from("project_messages")
            .insert({
                project_id: validation.data.project_id,
                sender_id: user.id,
                sender_name: senderName,
                sender_email: user.email,
                content: validation.data.content,
                task_id: validation.data.task_id || null,
                attachment_url: validation.data.attachment_url || null,
                attachment_type: validation.data.attachment_type || null,
                attachment_name: validation.data.attachment_name || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
        }

        const { data: recipient } = await supabase
            .from("requests")
            .select("user_id, name, email")
            .eq("id", validation.data.project_id)
            .single();

        if (recipient && recipient.user_id !== user.id) {
            await supabase.from("notifications").insert({
                user_id: recipient.user_id,
                type: "message",
                title: "New Message",
                message: `${senderName} sent you a message: ${validation.data.content.substring(0, 100)}${validation.data.content.length > 100 ? '...' : ''}`,
                request_id: validation.data.project_id,
                source_user_id: user.id,
                is_read: false
            });
        }

        const { data: profile } = await supabase
            .from("user_profiles")
            .select("id, full_name, avatar_url")
            .eq("id", user.id)
            .single();

        const messageWithSender = {
            ...message,
            reads: [],
            sender: profile ? {
                id: profile.id,
                full_name: profile.full_name || senderName,
                avatar_url: profile.avatar_url
            } : {
                id: user.id,
                full_name: senderName,
                avatar_url: null
            }
        };

        return NextResponse.json({ data: messageWithSender }, { status: 201 });
    } catch (error) {
        console.error("POST /api/messages error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
