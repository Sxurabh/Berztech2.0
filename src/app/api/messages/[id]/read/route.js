import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_READS_PER_WINDOW = 60;

const readRateLimitMap = new Map();

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

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        
        if (checkRateLimit(readRateLimitMap, ip, MAX_READS_PER_WINDOW)) {
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
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: message, error: msgError } = await supabase
            .from("project_messages")
            .select("project_id, sender_id, sender_name")
            .eq("id", id)
            .single();

        if (msgError || !message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message.sender_id === user.id) {
            return NextResponse.json({ error: "Cannot mark own message as read" }, { status: 400 });
        }

        const { data: project, error: projectError } = await supabase
            .from("requests")
            .select("user_id, client_email")
            .eq("id", message.project_id)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isProjectOwner = project.user_id === user.id;
        const isProjectClient = project.client_email === user.email;

        if (!isProjectOwner && !isProjectClient) {
            return NextResponse.json({ error: "Forbidden - not a project member" }, { status: 403 });
        }

        const { data, error } = await supabase
            .from("message_reads")
            .upsert({
                message_id: id,
                user_id: user.id,
                user_email: user.email,
                read_at: new Date().toISOString(),
            }, {
                onConflict: "message_id,user_id",
            })
            .select()
            .single();

        if (error) {
            console.error("[READ_RECEIPT] Mark read error:", error.code);
            return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("[READ_RECEIPT] PATCH /api/messages/[id]/read error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
