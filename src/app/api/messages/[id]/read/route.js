import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request, { params }) {
    try {
        // FIX: Await params in Next.js 15+
        const { id } = await params;
        
        console.log("[READ_RECEIPT] PATCH called with message id:", id);
        console.log("[READ_RECEIPT] Request URL:", request.url);
        
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        console.log("[READ_RECEIPT] Auth user:", user?.id, user?.email);

        if (!user) {
            console.log("[READ_RECEIPT] Unauthorized - no user");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: message, error: msgError } = await supabase
            .from("project_messages")
            .select("project_id, sender_id, sender_name")
            .eq("id", id)
            .single();

        console.log("[READ_RECEIPT] Message data:", message, "Error:", msgError);

        if (msgError || !message) {
            console.log("[READ_RECEIPT] Message not found, id:", id);
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message.sender_id === user.id) {
            console.log("[READ_RECEIPT] Cannot mark own message as read");
            return NextResponse.json({ error: "Cannot mark own message as read" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("message_reads")
            .upsert({
                message_id: id,
                user_id: user.id,
                user_email: user.email,
                read_at: new Date().toISOString(),
            }, {
                onConflict: "message_id,user_id",
            })
            .select()
            .single();

        console.log("[READ_RECEIPT] Upsert result - data:", data, "error:", error);

        if (error) {
            console.error("[READ_RECEIPT] Mark read error:", error);
            return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
        }

        console.log("[READ_RECEIPT] Success! Marked message as read");
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("[READ_RECEIPT] PATCH /api/messages/[id]/read error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
