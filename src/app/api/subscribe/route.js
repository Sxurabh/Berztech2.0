import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
        }

        const supabase = await createServerSupabaseClient();

        // Check if the user is already subscribed (we ignore errors because RLS might prevent read if not admin, but let's just attempt insert and handle unique constraint)
        const { error } = await supabase
            .from('subscribers')
            .insert({ email: email.toLowerCase().trim() });

        if (error) {
            // 23505 is the unique violation error code in PostgreSQL
            if (error.code === '23505') {
                // Return success anyway to avoid leaking whether an email is subscribed,
                // and it acts idempotently for the user.
                return NextResponse.json({ success: true, message: "Subscription received" }, { status: 201 });
            }
            console.error("Newsletter API Error:", error);
            return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Subscription received" }, { status: 201 });
    } catch (error) {
        console.error("Newsletter API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
