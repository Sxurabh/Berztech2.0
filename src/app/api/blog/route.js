import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

// GET /api/blog — List blog posts
// Public: returns published only. Admin: returns all.
export async function GET(request) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
            .from("blog_posts")
            .select("*")
            .order("created_at", { ascending: false });

        // Only return published posts for non-admin users
        if (!user || !isAdminEmail(user.email)) {
            query = query.eq("published", true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("GET /api/blog error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/blog — Create a new blog post (admin only)
export async function POST(request) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        // Whitelist allowed fields
        const slug = (body.slug || body.title || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        const payload = {
            slug,
            title: body.title,
            excerpt: body.excerpt || null,
            content: body.content || "",
            category: body.category || "General",
            image: body.image || null,
            author: body.author || "Berztech",
            read_time: body.read_time || null,
            published: !!body.published,
            featured: !!body.featured,
        };

        const { data, error } = await supabase
            .from("blog_posts")
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("POST /api/blog error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
