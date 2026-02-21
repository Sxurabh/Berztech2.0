import { createServerSupabaseClient } from "@/lib/supabase/server";
import { projects as staticProjects, filters as staticFilters } from "@/data/projects";
import { cache } from "react";

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
export const getProjects = cache(async () => {
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
});

/**
 * Get a single project by slug or ID.
 * @param {string} idOrSlug
 * @returns {Promise<Project|null>}
 */
export const getProjectById = cache(async (idOrSlug) => {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        // If it looks like a UUID, try finding by ID first
        if (isUUID) {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("id", idOrSlug)
                .maybeSingle();

            if (data) return data;
            if (error && error.code !== '22P02') console.warn("Project fetch by ID error:", error.message);
        }

        // Fallback: search by slug (or if it wasn't a UUID)
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("slug", idOrSlug)
            .maybeSingle();

        if (error) throw error;
        return data; // Returns null if not found
    } catch (err) {
        console.warn(`Supabase fetch failed (getProjectById: ${idOrSlug}):`, err.message);
        return null;
    }
});

/**
 * Get unique project categories.
 * @returns {Promise<string[]>}
 */
export const getProjectFilters = cache(async () => {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");

        const { data, error } = await supabase
            .from("projects")
            .select("category");

        if (error) throw error;

        const unique = [...new Set((data || []).map((p) => p.category).filter(Boolean))];
        return ["All", ...unique];
    } catch (err) {
        console.warn("Supabase fetch failed (getProjectFilters):", err.message);
        return ["All"];
    }
});

/**
 * Create a new project.
 * @param {Partial<Project>} projectData 
 * @returns {Promise<Project>}
 */
export async function createProject(projectData) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    let slug = (projectData.slug || projectData.client || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Fallback if slug is empty
    if (!slug) {
        slug = `project-${Date.now()}`;
    }

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

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from("projects").update(projectData);

    if (isUUID) {
        query = query.eq("id", id);
    } else {
        query = query.eq("slug", id);
    }

    const { data, error } = await query.select().single();

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

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabase.from("projects").delete();

    if (isUUID) {
        query = query.eq("id", id);
    } else {
        query = query.eq("slug", id);
    }

    const { error } = await query;

    if (error) throw error;
    return true;
}
