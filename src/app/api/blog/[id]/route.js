import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/blog/[id] — Get a single blog post
export async function GET(request, { params }) {
    try {
        const supabase = await createServerSupabaseClient();
        const isNumeric = !isNaN(params.id);

        let query = supabase.from("blog_posts").select("*");
        if (isNumeric) {
            query = query.eq("id", parseInt(params.id));
        } else {
            query = query.eq("slug", params.id);
        }

        const { data, error } = await query.single();
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

// PUT /api/blog/[id] — Update a blog post (authenticated)
export async function PUT(request, { params }) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { data, error } = await supabase
            .from("blog_posts")
            .update(body)
            .eq("id", parseInt(params.id))
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

// DELETE /api/blog/[id] — Delete a blog post (authenticated)
export async function DELETE(request, { params }) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("blog_posts")
            .delete()
            .eq("id", parseInt(params.id));

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
