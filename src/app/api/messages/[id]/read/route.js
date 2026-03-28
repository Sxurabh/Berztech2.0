import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: message } = await supabase
            .from("project_messages")
            .select("project_id, sender_id")
            .eq("id", id)
            .single();

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message.sender_id === user.id) {
            return NextResponse.json({ error: "Cannot mark own message as read" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("message_reads")
            .upsert({
                message_id: id,
                user_id: user.id,
                read_at: new Date().toISOString(),
            }, {
                onConflict: "message_id,user_id",
            })
            .select()
            .single();

        if (error) {
            console.error("Mark read error:", error);
            return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("PATCH /api/messages/[id]/read error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}
