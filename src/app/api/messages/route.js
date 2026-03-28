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

async function checkProjectAccess(supabase, projectId, userId, userEmail) {
    const { data: project, error } = await supabase
        .from("projects")
        .select("id, client_email")
        .eq("id", projectId)
        .single();

    if (error || !project) return false;

    if (project.client_email === userEmail) return true;

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single();

    return profile?.is_admin === true;
}

export async function GET(request) {
    try {
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

        const hasAccess = await checkProjectAccess(supabase, projectId, user.id, user.email);
        if (!hasAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let query = supabase
            .from("project_messages")
            .select(`
                *,
                sender:profiles(id, full_name, avatar_url),
                reads:message_reads(user_id, read_at)
            `)
            .eq("project_id", projectId)
            .order("created_at", { ascending: true })
            .limit(limit);

        if (before) {
            query = query.lt("created_at", before);
        }

        const { data: messages, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({ data: messages || [] }, { status: 200 });
    } catch (error) {
        console.error("GET /api/messages error:", error);
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

        const hasAccess = await checkProjectAccess(supabase, validation.data.project_id, user.id, user.email);
        if (!hasAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { data: message, error } = await supabase
            .from("project_messages")
            .insert({
                project_id: validation.data.project_id,
                sender_id: user.id,
                content: validation.data.content,
                task_id: validation.data.task_id || null,
                attachment_url: validation.data.attachment_url || null,
                attachment_type: validation.data.attachment_type || null,
                attachment_name: validation.data.attachment_name || null,
            })
            .select(`
                *,
                sender:profiles(id, full_name, avatar_url)
            `)
            .single();

        if (error) {
            console.error("Insert error:", error);
            return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
        }

        return NextResponse.json({ data: { ...message, reads: [] } }, { status: 201 });
    } catch (error) {
        console.error("POST /api/messages error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
