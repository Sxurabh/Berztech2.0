import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("project_id");

        console.log("[DEBUG_MESSAGES] projectId:", projectId);

        const supabase = await createServerSupabaseClient();

        // Get messages
        const { data: messages, error: messagesError } = await supabase
            .from("project_messages")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false })
            .limit(20);

        console.log("[DEBUG_MESSAGES] Messages:", messages, "Error:", messagesError);

        // Get reads
        const { data: reads, error: readsError } = await supabase
            .from("message_reads")
            .select("*")
            .in("message_id", messages?.map(m => m.id) || []);

        console.log("[DEBUG_MESSAGES] Reads:", reads, "Error:", readsError);

        // Get profiles
        const senderIds = [...new Set(messages?.map(m => m.sender_id) || [])];
        console.log("[DEBUG_MESSAGES] Sender IDs:", senderIds);

        const { data: profiles, error: profilesError } = await supabase
            .from("user_profiles")
            .select("*")
            .in("id", senderIds);

        console.log("[DEBUG_MESSAGES] Profiles:", profiles, "Error:", profilesError);

        // Get user_presence
        const { data: presence, error: presenceError } = await supabase
            .from("user_presence")
            .select("*")
            .in("user_id", senderIds);

        console.log("[DEBUG_MESSAGES] Presence:", presence, "Error:", presenceError);

        return NextResponse.json({
            messages,
            reads,
            profiles,
            presence,
            summary: {
                messagesCount: messages?.length || 0,
                readsCount: reads?.length || 0,
                profilesCount: profiles?.length || 0,
                senderIds
            }
        });
    } catch (error) {
        console.error("[DEBUG_MESSAGES] Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
