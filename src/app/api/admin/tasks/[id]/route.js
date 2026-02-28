import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/config/admin";

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const admin = createAdminClient();

        const updates = { updated_at: new Date().toISOString() };

        if (body.title !== undefined) updates.title = body.title;
        if (body.description !== undefined) updates.description = body.description;
        if (body.status !== undefined) updates.status = body.status;
        if (body.priority !== undefined) updates.priority = body.priority;
        if (body.order_index !== undefined) updates.order_index = body.order_index;
        if (body.project_id !== undefined) updates.project_id = body.project_id || null;
        if (body.request_id !== undefined) {
            updates.request_id = body.request_id === "undefined" ? null : (body.request_id || null);
            // Sync client_id if request_id changes
            if (updates.request_id) {
                const { data: reqData } = await admin
                    .from("requests")
                    .select("user_id")
                    .eq("id", updates.request_id)
                    .single();
                if (reqData) updates.client_id = reqData.user_id;
            } else {
                updates.client_id = null; // Unlink client if request is removed
            }
        }

        const { data, error } = await admin
            .from("tasks")
            .update(updates)
            .eq("id", id)
            .select(`
                *,
                projects ( id, title ),
                requests ( id, message, user_id ),
                task_comments ( count )
            `)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = createAdminClient();

        const { error } = await admin
            .from("tasks")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
