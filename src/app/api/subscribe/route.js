import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const SubscribeSchema = z.object({
    email: z.string({ required_error: "A valid email address is required" }).email("A valid email address is required"),
});

function getEmailValidationError(issues) {
    if (!issues || issues.length === 0) {
        return "A valid email address is required";
    }
    const firstIssue = issues[0];
    if (firstIssue.path.includes('email')) {
        return "A valid email address is required";
    }
    return firstIssue.message || "A valid email address is required";
}

export async function POST(req) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const validation = SubscribeSchema.safeParse(body);
        if (!validation.success) {
            const errorMessage = getEmailValidationError(validation.error.issues);
            return NextResponse.json({ error: errorMessage }, { status: 400 });
        }

        const { email } = validation.data;
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from('subscribers')
            .insert({ email: email.toLowerCase().trim() });

        if (error) {
            if (error.code === '23505') {
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
