import { createServerSupabaseClient } from "@/lib/supabase/server";
import { posts as staticPosts, categories as staticCategories } from "@/data/blogPosts";

/**
 * Get published blog posts from Supabase, with static data fallback.
 */
export async function getPosts({ published = true } = {}) {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");
        let query = supabase
            .from("blog_posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (published) {
            query = query.eq("published", true);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (data && data.length > 0) return data;
    } catch (err) {
        console.warn("Supabase fetch failed, using static data:", err.message);
    }
    return staticPosts;
}

/**
 * Get a single post by id or slug.
 */
export async function getPostById(identifier) {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");
        const isNumeric = !isNaN(identifier);

        let query = supabase.from("blog_posts").select("*");
        if (isNumeric) {
            query = query.eq("id", parseInt(identifier));
        } else {
            query = query.eq("slug", identifier);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        if (data) return data;
    } catch (err) {
        console.warn("Supabase fetch failed, using static data:", err.message);
    }
    return staticPosts.find((p) => p.id === parseInt(identifier) || p.slug === identifier) || null;
}

/**
 * Get unique blog categories.
 */
export async function getBlogCategories() {
    try {
        const supabase = await createServerSupabaseClient();
        if (!supabase) throw new Error("Supabase not configured");
        const { data, error } = await supabase
            .from("blog_posts")
            .select("category")
            .eq("published", true);

        if (error) throw error;
        if (data && data.length > 0) {
            const unique = [...new Set(data.map((p) => p.category))];
            return ["All", ...unique];
        }
    } catch (err) {
        console.warn("Supabase fetch failed, using static categories:", err.message);
    }
    return staticCategories;
}

/**
 * Create a new blog post.
 */
export async function createPost(postData) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");

    // Auto-generate slug from title if not provided
    if (!postData.slug) {
        postData.slug = postData.title
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    const { data, error } = await supabase
        .from("blog_posts")
        .insert(postData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update an existing blog post.
 */
export async function updatePost(id, postData) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { data, error } = await supabase
        .from("blog_posts")
        .update(postData)
        .eq("id", parseInt(id))
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete a blog post.
 */
export async function deletePost(id) {
    const supabase = await createServerSupabaseClient();
    if (!supabase) throw new Error("Supabase not configured");
    const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", parseInt(id));

    if (error) throw error;
    return true;
}
