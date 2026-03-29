
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

        const admin = createAdminClient();

        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const unreadOnly = url.searchParams.get("unread") === "true";

        let query = admin
            .from("notifications")
            .select("*, tasks(title, status, request_id)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (unreadOnly) {
            query = query.eq("is_read", false);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { count } = await admin
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        return NextResponse.json({ 
            data: data || [], 
            unread_count: count || 0 
        }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const supabase = await createServerSupabaseClient();
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { notification_id, all_read } = body;
        const admin = createAdminClient();

        if (all_read) {
            const { error } = await admin
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);

            if (error) {
                console.error("Mark all read error:", error);
                return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 });
            }

            return NextResponse.json({ success: true });
        }

        if (!notification_id) {
            return NextResponse.json({ error: "notification_id is required" }, { status: 400 });
        }

        const { error } = await admin
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notification_id)
            .eq("user_id", user.id);

        if (error) {
            console.error("Mark read error:", error);
            return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PATCH /api/notifications error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
