import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const projectId = url.searchParams.get("project_id");

        if (!projectId) {
            return NextResponse.json({ error: "project_id is required" }, { status: 400 });
        }

        const admin = createAdminClient();
        const { data, error } = await admin
            .from("project_messages")
            .select(`
                *,
                message_reads (*)
            `)
            .eq("project_id", projectId)
            .order("created_at", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] }, { status: 200 });
    } catch (err) {
        console.error("GET /api/messages error:", err);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { project_id, content, attachment_url, attachment_type, attachment_name } = body;

        if (!project_id) {
            return NextResponse.json({ error: "project_id is required" }, { status: 400 });
        }

        if (!content && !attachment_url) {
            return NextResponse.json({ error: "Message content or attachment is required" }, { status: 400 });
        }

        const admin = createAdminClient();
        const { data, error } = await admin
            .from("project_messages")
            .insert({
                project_id,
                content: content || "",
                sender: "admin",
                sender_id: user.id,
                sender_email: user.email,
                attachment_url: attachment_url || null,
                attachment_type: attachment_type || null,
                attachment_name: attachment_name || null,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        console.error("POST /api/messages error:", err);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
