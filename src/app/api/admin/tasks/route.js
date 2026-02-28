import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/config/admin";

export async function GET(req) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = createAdminClient();

        // Check if we are filtering by a specific request
        const url = new URL(req.url);
        let requestId = url.searchParams.get("requestId");
        if (requestId === "undefined") requestId = null;

        let query = admin
            .from("tasks")
            .select(`
                *,
                task_comments ( count )
            `)
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

export async function POST(req) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        let { title, description, priority, status, request_id } = body;

        request_id = request_id === "undefined" ? null : request_id;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const admin = createAdminClient();

        // 1. If linked to a request, automatically inherit its client_id
        let client_id = null;
        if (request_id) {
            const { data: reqData } = await admin
                .from("requests")
                .select("user_id")
                .eq("id", request_id)
                .single();
            if (reqData) client_id = reqData.user_id;
        }

        // Getmax order index for the given status to place it at the bottom
        let orderQuery = admin
            .from("tasks")
            .select("order_index")
            .eq("status", status || "backlog")
            .order("order_index", { ascending: false })
            .limit(1);

        if (request_id) {
            orderQuery = orderQuery.eq("request_id", request_id);
        }

        const { data: existingTasks } = await orderQuery;

        const newOrderIndex = existingTasks?.length > 0 ? (existingTasks[0].order_index || 0) + 1024 : 1024;

        const { data, error } = await admin
            .from("tasks")
            .insert({
                title,
                description,
                priority: priority || "medium",
                status: status || "backlog",
                client_id: client_id || null,
                request_id: request_id || null,
                order_index: newOrderIndex
            })
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

        return NextResponse.json({ data }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
