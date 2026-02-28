import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useProjectStats() {
    const [stats, setStats] = useState({ projects: null, posts: null, testimonials: null });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [recentTestimonials, setRecentTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        const supabase = createClient();
        try {
            const [projectsRes, postsRes, testiRes] = await Promise.all([
                supabase.from("projects").select("id, client, title, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(15),
                supabase.from("blog_posts").select("id, title, published, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(15),
                supabase.from("testimonials").select("id, client, company, content, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(15),
            ]);

            setStats({
                projects: projectsRes.count ?? 0,
                posts: postsRes.count ?? 0,
                testimonials: testiRes.count ?? 0,
            });
            setRecentProjects(projectsRes.data || []);
            setRecentPosts(postsRes.data || []);
            setRecentTestimonials(testiRes.data || []);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const refreshStats = () => {
        return fetchStats();
    };

    return { stats, recentProjects, recentPosts, recentTestimonials, loading, refreshStats };
}
