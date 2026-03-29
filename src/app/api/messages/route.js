import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_MESSAGES_PER_WINDOW = 30;
const MAX_FETCHES_PER_WINDOW = 60;

const messageRateLimitMap = new Map();
const fetchRateLimitMap = new Map();

function checkRateLimit(map, key, maxRequests) {
    const now = Date.now();
    const data = map.get(key) || { count: 0, startTime: now };

    if (now - data.startTime > RATE_LIMIT_WINDOW_MS) {
        data.count = 1;
        data.startTime = now;
    } else {
        data.count += 1;
    }
    map.set(key, data);

    return data.count >= maxRequests;
}

function sanitizeContent(content) {
    if (!content) return content;
    
    const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<script\b[^>]*>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<svg[^>]*onload[^>]*>/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
    ];

    let sanitized = content;
    dangerousPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
}

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
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        
        if (checkRateLimit(fetchRateLimitMap, ip, MAX_FETCHES_PER_WINDOW)) {
            const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
            return NextResponse.json(
                { error: "Rate limit exceeded. Try again later." }, 
                { 
                    status: 429,
                    headers: { "retry-after": String(retryAfter) }
                }
            );
        }

        const supabase = await createServerSupabaseClient();
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("project_id");
        const limit = parseInt(searchParams.get("limit") || "50");
        const before = searchParams.get("before");

        if (!projectId) {
            return NextResponse.json({ error: "project_id is required" }, { status: 400 });
        }

        const { data: { user } } = await supabase.auth.getUser();
        
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

        if (error) {
            console.error("[GET_MESSAGES] Database error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        if (!messages || messages.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }

        const messageIds = messages.map(m => m.id);

        const { data: reads } = await supabase
            .from("message_reads")
            .select("*")
            .in("message_id", messageIds);

        const readsMap = {};
        reads?.forEach(r => {
            if (!readsMap[r.message_id]) readsMap[r.message_id] = [];
            readsMap[r.message_id].push(r);
        });

        const senderIds = [...new Set(messages.map(m => m.sender_id))];

        const { data: profiles } = await supabase
            .from("user_profiles")
            .select("id, full_name, avatar_url")
            .in("id", senderIds);

        const profilesMap = {};
        profiles?.forEach(p => {
            profilesMap[p.id] = p;
        });

        const messagesWithReads = messages.map(msg => {
            const sender = profilesMap[msg.sender_id];
            return {
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
        });

        return NextResponse.json({ data: messagesWithReads }, { status: 200 });
    } catch (error) {
        console.error("[GET_MESSAGES] GET /api/messages error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        
        if (checkRateLimit(messageRateLimitMap, ip, MAX_MESSAGES_PER_WINDOW)) {
            const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
            return NextResponse.json(
                { error: "Rate limit exceeded. Try again later." }, 
                { 
                    status: 429,
                    headers: { "retry-after": String(retryAfter) }
                }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const validation = CreateMessageSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed" },
                { status: 400 }
            );
        }

        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const senderName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const sanitizedContent = sanitizeContent(validation.data.content);

        const { data: message, error } = await supabase
            .from("project_messages")
            .insert({
                project_id: validation.data.project_id,
                sender_id: user.id,
                sender_name: senderName,
                sender_email: user.email,
                content: sanitizedContent,
                task_id: validation.data.task_id || null,
                attachment_url: validation.data.attachment_url || null,
                attachment_type: validation.data.attachment_type || null,
                attachment_name: validation.data.attachment_name || null,
            })
            .select()
            .single();

        if (error) {
            console.error("[POST_MESSAGES] Insert error:", error.code);
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
                message: `${senderName} sent you a message: ${sanitizedContent.substring(0, 100)}${sanitizedContent.length > 100 ? '...' : ''}`,
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
