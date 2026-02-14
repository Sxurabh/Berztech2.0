import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";

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
        console.error("GET /api/blog/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/blog/[id] — Update a blog post (admin only)
export async function PUT(request, { params }) {
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
        const payload = {};
        const allowed = ["title", "slug", "excerpt", "content", "category", "image", "author", "read_time", "published", "featured"];
        for (const key of allowed) {
            if (body[key] !== undefined) payload[key] = body[key];
        }

        const { data, error } = await supabase
            .from("blog_posts")
            .update(payload)
            .eq("id", parseInt(params.id))
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        console.error("PUT /api/blog/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/blog/[id] — Delete a blog post (admin only)
export async function DELETE(request, { params }) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { error } = await supabase
            .from("blog_posts")
            .delete()
            .eq("id", parseInt(params.id));

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/blog/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
