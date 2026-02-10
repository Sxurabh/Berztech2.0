import { createServerSupabaseClient } from "@/lib/supabase/server";
import { projects as staticProjects, filters as staticFilters } from "@/data/projects";

/**
 * Get all projects from Supabase, with static data fallback.
 */
export async function getProjects() {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .order("featured", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) return data;
    } catch (err) {
        console.warn("Supabase fetch failed, using static data:", err.message);
    }
    return staticProjects;
}

/**
 * Get a single project by slug/id.
 */
export async function getProjectById(id) {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .or(`id.eq.${id},slug.eq.${id}`)
            .single();

        if (error) throw error;
        if (data) return data;
    } catch (err) {
        console.warn("Supabase fetch failed, using static data:", err.message);
    }
    return staticProjects.find((p) => p.id === id) || null;
}

/**
 * Get unique project categories for filters.
 */
export async function getProjectFilters() {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");
        const { data, error } = await supabase
            .from("projects")
            .select("category");

        if (error) throw error;
        if (data && data.length > 0) {
            const unique = [...new Set(data.map((p) => p.category))];
            return ["All", ...unique];
        }
    } catch (err) {
        console.warn("Supabase fetch failed, using static filters:", err.message);
    }
    return staticFilters;
}

/**
 * Create a new project (used by API route).
 */
export async function createProject(projectData) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    // Auto-generate slug from client name if not provided
    if (!projectData.slug) {
        projectData.slug = projectData.client
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    const { data, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update an existing project.
 */
export async function updateProject(id, projectData) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a project.
 */
export async function deleteProject(id) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
    return true;
}
