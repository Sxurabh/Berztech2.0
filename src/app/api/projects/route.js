import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/projects — List all projects (public)
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/projects — Create a new project (authenticated)
export async function POST(request) {
    try {
        const supabase = await createServerSupabaseClient();

        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Auto-generate slug if not provided
        if (!body.slug && body.client) {
            body.slug = body.client
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
        }

        // Auto-generate id from slug if not provided
        if (!body.id) {
            body.id = body.slug;
        }

        const { data, error } = await supabase
            .from("projects")
            .insert(body)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
