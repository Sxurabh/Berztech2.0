import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";
import { getProjects, createProject } from "@/lib/data/projects";

// GET /api/projects — List all projects (public)
export async function GET() {
    try {
        const projects = await getProjects();
        return NextResponse.json(projects);
    } catch (error) {
        console.error("GET /api/projects error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/projects — Create a new project (admin only)
export async function POST(request) {
    try {
        const supabase = await createServerSupabaseClient();

        // Verify admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        // Whitelist allowed fields to prevent injection
        const payload = {
            id: body.id, // optional, handled by service if missing
            slug: body.slug, // optional
            client: body.client,
            title: body.title,
            description: body.description,
            category: body.category,
            image: body.image,
            services: body.services,
            stats: body.stats,
            color: body.color,
            year: body.year,
            featured: !!body.featured,
        };

        const newProject = await createProject(payload);
        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error("POST /api/projects error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
