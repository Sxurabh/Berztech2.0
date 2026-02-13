import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/config/admin";

// PATCH /api/admin/requests/[id] — update request status (admin only)
export async function PATCH(request, context) {
    try {
        const params = await Promise.resolve(context.params);
        const id = params?.id;
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: "Status required" }, { status: 400 });
        }

        const validStatuses = ["discover", "define", "design", "develop", "deliver", "maintain"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const admin = createAdminClient();
        if (!admin) {
            return NextResponse.json({ error: "Server error" }, { status: 500 });
        }

        const { data, error } = await admin
            .from("requests")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
