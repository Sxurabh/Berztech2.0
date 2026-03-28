import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req, { params }) {
    try {
        const { id } = params;
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = createAdminClient();
        const { data: existing } = await admin
            .from("message_reads")
            .select("*")
            .eq("message_id", id)
            .eq("user_id", user.id)
            .single();

        if (existing) {
            return NextResponse.json({ data: existing }, { status: 200 });
        }

        const { data, error } = await admin
            .from("message_reads")
            .insert({
                message_id: id,
                user_id: user.id,
                user_email: user.email,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        console.error("PATCH /api/messages/[id]/read error:", err);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
