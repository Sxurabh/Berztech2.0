import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// GET /api/blog — List blog posts
// Public: returns published only. Authenticated: returns all.
export async function GET(request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
            .from("blog_posts")
            .select("*")
            .order("created_at", { ascending: false });

        // Only return published posts for non-authenticated users
        if (!user) {
            query = query.eq("published", true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// POST /api/blog — Create a new blog post (authenticated)
export async function POST(request) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        // Auto-generate slug from title if not provided
        if (!body.slug && body.title) {
            body.slug = body.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
        }

        const { data, error } = await supabase
            .from("blog_posts")
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
