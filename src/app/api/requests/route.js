import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

const requestSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    company: z.string().optional(),
    services: z.array(z.string()).optional(),
    budget: z.string().optional(),
    message: z.string().max(1000, "Message too long").optional(),
});

// GET /api/requests — list requests for the current user
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("requests")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("API GET error:", error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}


// POST /api/requests — create a new project request
export async function POST(request) {
    try {
        const body = await request.json();

        // Validate input
        const result = requestSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.format() },
                { status: 400 }
            );
        }

        const data = result.data;
        const supabase = await createServerSupabaseClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const payload = {
            name: data.name,
            email: data.email,
            company: data.company || null,
            services: data.services || [],
            budget: data.budget || null,
            message: data.message || "",
            status: "discover",
            user_id: user?.id || null,
        };

        const { data: insertedData, error } = await supabase
            .from("requests")
            .insert(payload)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: insertedData }, { status: 201 });
    } catch (error) {
        console.error("API POST error:", error);
        return NextResponse.json({ error: "Invalid request body or server error" }, { status: 400 });
    }
}

