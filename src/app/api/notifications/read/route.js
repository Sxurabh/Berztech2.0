

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const admin = createAdminClient();

        if (body.all) {
            // Mark all unread notifications as read
            const { error } = await admin
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ success: true }, { status: 200 });
        }

        if (body.id) {
            // Mark a single notification as read
            const { data, error } = await admin
                .from("notifications")
                .update({ is_read: true })
                .eq("id", body.id)
                .eq("user_id", user.id)
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ data }, { status: 200 });
        }

        return NextResponse.json({ error: "Provide 'id' or 'all: true'" }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
