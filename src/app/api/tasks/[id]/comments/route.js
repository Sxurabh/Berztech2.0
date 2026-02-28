import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch comments using admin client. 
        // We will manually verify if the user has access to the task first.
        const admin = createAdminClient();

        const { data: taskData, error: taskError } = await admin
            .from("tasks")
            .select("client_id")
            .eq("id", id)
            .single();

        if (taskError || !taskData) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        // Need to check if user is admin, if not, verify they are the client corresponding to the task
        const { isAdminEmail } = await import("@/config/admin");
        if (!isAdminEmail(user.email) && taskData.client_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch comments
        const { data, error } = await admin
            .from("task_comments")
            .select("*")
            .eq("task_id", id)
            .order("created_at", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { content } = body;

        if (!content || !content.trim()) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const admin = createAdminClient();

        // Check access
        const { data: taskData, error: taskError } = await admin
            .from("tasks")
            .select("client_id")
            .eq("id", id)
            .single();

        if (taskError || !taskData) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const { isAdminEmail } = await import("@/config/admin");
        if (!isAdminEmail(user.email) && taskData.client_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { data, error } = await admin
            .from("task_comments")
            .insert({
                task_id: id,
                user_id: user.id,
                content: content.trim()
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
