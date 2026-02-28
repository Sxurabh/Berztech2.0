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

        // Check access and get task details
        const { data: taskData, error: taskError } = await admin
            .from("tasks")
            .select("client_id, title, request_id")
            .eq("id", id)
            .single();

        if (taskError || !taskData) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const { isAdminEmail } = await import("@/config/admin");
        const userIsAdmin = isAdminEmail(user.email);

        if (!userIsAdmin && taskData.client_id !== user.id) {
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

        // ── Create notifications for the other party ──
        try {
            const senderName = user.user_metadata?.full_name?.split(" ")?.[0] || user.email?.split("@")[0] || "Someone";
            const truncatedContent = content.trim().length > 80 ? content.trim().slice(0, 80) + "…" : content.trim();

            if (userIsAdmin && taskData.client_id) {
                // Admin commented → notify the client
                await admin.from("notifications").insert({
                    user_id: taskData.client_id,
                    type: "comment",
                    title: `New reply on "${taskData.title}"`,
                    message: `${senderName}: ${truncatedContent}`,
                    task_id: id,
                    request_id: taskData.request_id || null,
                    source_user_id: user.id,
                });
            } else if (!userIsAdmin) {
                // Client commented → notify all admins
                const { data: admins } = await admin.from("admin_users").select("email");
                if (admins && admins.length > 0) {
                    // Get admin user IDs from auth.users via their emails
                    for (const adminRow of admins) {
                        const { data: adminAuth } = await admin.auth.admin.listUsers();
                        const adminUser = adminAuth?.users?.find(u => u.email === adminRow.email);
                        if (adminUser) {
                            await admin.from("notifications").insert({
                                user_id: adminUser.id,
                                type: "comment",
                                title: `New feedback on "${taskData.title}"`,
                                message: `${senderName}: ${truncatedContent}`,
                                task_id: id,
                                request_id: taskData.request_id || null,
                                source_user_id: user.id,
                            });
                        }
                    }
                }
            }
        } catch (notifError) {
            // Don't fail the comment if notification fails
            console.error("Failed to create notification:", notifError);
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
