import { createServerSupabaseClient } from "@/lib/supabase/server";
import { projects as staticProjects, filters as staticFilters } from "@/data/projects";

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} slug
 * @property {string} client
 * @property {string} title
 * @property {string} [description]
 * @property {string} category
 * @property {string} [image]
 * @property {string[]} services
 * @property {Object} stats
 * @property {string} color
 * @property {string} [year]
 * @property {boolean} featured
 */

/**
 * Get all projects from Supabase.
 * Falls back to static data ONLY on connection error, not on empty data.
 * @returns {Promise<Project[]>}
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
        // Return actual data (even if empty array) to respect DB state
        return data || [];
    } catch (err) {
        console.warn("Supabase fetch failed (getProjects), using static fallback:", err.message);
        return staticProjects;
    }
}

/**
 * Get a single project by slug or ID.
 * @param {string} idOrSlug
 * @returns {Promise<Project|null>}
 */
export async function getProjectById(idOrSlug) {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");

        // Try by ID first if it looks like a valid ID (UUID or similar), otherwise strictly by slug?
        // Actually, let's keep the sequential check pattern for robustness
        let { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("id", idOrSlug)
            .maybeSingle();

        if (!data && !error) {
            ({ data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("slug", idOrSlug)
                .maybeSingle());
        }

        if (error) throw error;
        if (data) return data;
    } catch (err) {
        console.warn(`Supabase fetch failed (getProjectById: ${idOrSlug}):`, err.message);
        return null;
    }
    return null;
}

/**
 * Get unique project categories.
 * @returns {Promise<string[]>}
 */
export async function getProjectFilters() {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");

        const { data, error } = await supabase
            .from("projects")
            .select("category");

        if (error) throw error;

        const unique = [...new Set((data || []).map((p) => p.category))];
        return ["All", ...unique];
    } catch (err) {
        console.warn("Supabase fetch failed (getProjectFilters):", err.message);
        return ["All"];
    }
}

/**
 * Create a new project.
 * @param {Partial<Project>} projectData 
 * @returns {Promise<Project>}
 */
export async function createProject(projectData) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const slug = (projectData.slug || projectData.client || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload = {
        ...projectData,
        slug,
        // Ensure ID is set if not provided (use slug as fallback ID pattern)
        id: projectData.id || slug
    };

    const { data, error } = await supabase
        .from("projects")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update an existing project.
 * @param {string} id 
 * @param {Partial<Project>} projectData 
 * @returns {Promise<Project>}
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
 * @param {string} id 
 * @returns {Promise<boolean>}
 */
export async function deleteProject(id) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
}
