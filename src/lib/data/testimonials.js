import { createServerSupabaseClient } from "@/lib/supabase/server";

// Static fallback data for development (if needed/requested, but user wants to remove it)
// We'll keep empty array as default to avoid showing dummy data.

/**
 * Get all testimonials.
 */
export async function getTestimonials() {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");

        const { data, error } = await supabase
            .from("testimonials")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.warn("Supabase fetch failed (getTestimonials):", err.message);
        return [];
    }
}

/**
 * Get a single testimonial.
 */
export async function getTestimonialById(id) {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");

        const { data, error } = await supabase
            .from("testimonials")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    } catch (err) {
        console.warn("Supabase fetch failed (getTestimonialById):", err.message);
        return null;
    }
}

/**
 * Create a testimonial.
 */
export async function createTestimonial(data) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const payload = {
        client: data.client, // author name
        role: data.role,
        company: data.company,
        content: data.content, // quote
        image: data.image,
        metric: data.metric,
        metric_label: data.metric_label, // metricLabel in frontend
        color: data.color || "blue",
        featured: !!data.featured
    };

    const { data: newTestimonial, error } = await supabase
        .from("testimonials")
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return newTestimonial;
}

/**
 * Update a testimonial.
 */
export async function updateTestimonial(id, data) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const payload = {};
    if (data.client !== undefined) payload.client = data.client;
    if (data.role !== undefined) payload.role = data.role;
    if (data.company !== undefined) payload.company = data.company;
    if (data.content !== undefined) payload.content = data.content;
    if (data.image !== undefined) payload.image = data.image;
    if (data.metric !== undefined) payload.metric = data.metric;
    if (data.metric_label !== undefined) payload.metric_label = data.metric_label;
    if (data.color !== undefined) payload.color = data.color;
    if (data.featured !== undefined) payload.featured = data.featured;

    const { data: updated, error } = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return updated;
}

/**
 * Delete a testimonial.
 */
export async function deleteTestimonial(id) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
}
