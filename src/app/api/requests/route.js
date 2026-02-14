import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
        const supabase = await createServerSupabaseClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const payload = {
            name: body.name,
            email: body.email,
            company: body.company || null,
            services: body.services || [],
            budget: body.budget || null,
            message: body.message || "",
            status: "discover",
            user_id: user?.id || null,
        };

        const { data, error } = await supabase
            .from("requests")
            .insert(payload)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error("API POST error:", error);
        return NextResponse.json({ error: "Invalid request body or server error" }, { status: 400 });
    }
}

