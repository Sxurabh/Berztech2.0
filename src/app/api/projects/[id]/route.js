import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";
import { getProjectById, updateProject, deleteProject } from "@/lib/data/projects";

// GET /api/projects/[id] — Get a single project
export async function GET(request, { params }) {
    try {
        const project = await getProjectById(params.id);
        if (!project) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(project);
    } catch (error) {
        console.error("GET /api/projects/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] — Update a project (admin only)
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
        const allowed = ["client", "title", "description", "category", "image", "services", "stats", "color", "year", "featured", "slug"];
        for (const key of allowed) {
            if (body[key] !== undefined) payload[key] = body[key];
        }

        // Service layer handles the DB update
        const updated = await updateProject(params.id, payload);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/projects/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] — Delete a project (admin only)
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

        await deleteProject(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/projects/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
