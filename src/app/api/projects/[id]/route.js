import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/projects/[id] — Get a single project
export async function GET(request, { params }) {
    try {
        const supabase = createServerSupabaseClient();
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .or(`id.eq.${params.id},slug.eq.${params.id}`)
            .single();

        if (error) throw error;
        if (!data) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] — Update a project (authenticated)
export async function PUT(request, { params }) {
    try {
        const supabase = createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { data, error } = await supabase
            .from("projects")
            .update(body)
            .eq("id", params.id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] — Delete a project (authenticated)
export async function DELETE(request, { params }) {
    try {
        const supabase = createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", params.id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
