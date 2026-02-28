
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

        // Clean up: delete read notifications older than 3 hours
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        await admin
            .from("notifications")
            .delete()
            .eq("user_id", user.id)
            .eq("is_read", true)
            .lt("created_at", threeHoursAgo);

        // Fetch remaining notifications (unread + recently-read)
        const { data, error } = await admin
            .from("notifications")
            .select("*, tasks(title, status, request_id)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
