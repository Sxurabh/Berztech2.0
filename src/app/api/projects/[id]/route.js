import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/config/admin";
import { getProjectById, updateProject, deleteProject } from "@/lib/data/projects";

// GET /api/projects/[id] — Get a single project
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const project = await getProjectById(id);
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
        const { id } = await params;
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        // Whitelist allowed fields
        const payload = {};
        const allowed = ["client", "title", "description", "category", "image", "services", "stats", "color", "year", "featured", "slug", "gallery"];
        for (const key of allowed) {
            if (body[key] !== undefined) {
                // Special handling for boolean fields to ensure they are consistent
                if (key === "featured") {
                    payload[key] = !!body[key];
                } else {
                    payload[key] = body[key];
                }
            }
        }

        if (Object.keys(payload).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        // Service layer handles the DB update
        const updated = await updateProject(id, payload);

        if (!updated) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

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
        const { id } = await params;
        const supabase = await createServerSupabaseClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!isAdminEmail(user.email)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await deleteProject(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/projects/[id] error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
