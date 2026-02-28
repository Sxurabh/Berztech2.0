import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(req) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        let requestId = url.searchParams.get("requestId");
        if (requestId === "undefined") requestId = null;

        // Clients can only see tasks where they are the client_id
        let query = supabase
            .from("tasks")
            .select(`
                *,
                projects ( title ),
                requests ( company, name, services ),
                task_comments ( count )
            `)
            .eq("client_id", user.id)
            .order("order_index", { ascending: true })
            .order("created_at", { ascending: false });

        if (requestId) {
            query = query.eq("request_id", requestId);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
