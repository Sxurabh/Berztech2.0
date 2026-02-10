"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiBriefcase, FiFileText, FiPlus, FiTrendingUp } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";

function StatCard({ icon: Icon, label, value, href, color = "neutral" }) {
    const colorMap = {
        neutral: "border-neutral-800 hover:border-neutral-700",
        blue: "border-blue-900/50 hover:border-blue-800/50",
        emerald: "border-emerald-900/50 hover:border-emerald-800/50",
        purple: "border-purple-900/50 hover:border-purple-800/50",
    };

    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -2 }}
                className={`p-5 bg-neutral-900/50 border ${colorMap[color]} transition-all duration-300`}
            >
                <div className="flex items-center justify-between mb-3">
                    <Icon className="w-5 h-5 text-neutral-500" />
                    <FiTrendingUp className="w-4 h-4 text-neutral-700" />
                </div>
                <div className="font-space-grotesk text-3xl font-medium text-white mb-1">
                    {value ?? "—"}
                </div>
                <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                    {label}
                </div>
            </motion.div>
        </Link>
    );
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ projects: null, posts: null, published: null });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient();

            const [projectsRes, postsRes] = await Promise.all([
                supabase.from("projects").select("id, client, title, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
                supabase.from("blog_posts").select("id, title, published, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
            ]);

            setStats({
                projects: projectsRes.count ?? 0,
                posts: postsRes.count ?? 0,
                published: postsRes.data?.filter((p) => p.published).length ?? 0,
            });
            setRecentProjects(projectsRes.data || []);
            setRecentPosts(postsRes.data || []);
        }

        fetchStats();
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-px w-4 bg-neutral-700" />
                    <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                        Dashboard
                    </span>
                </div>
                <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-white tracking-tight">
                    Welcome back
                    {user?.email && (
                        <span className="text-neutral-500">, {user.email.split("@")[0]}</span>
                    )}
                </h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <StatCard icon={FiBriefcase} label="Total Projects" value={stats.projects} href="/admin/projects" color="blue" />
                <StatCard icon={FiFileText} label="Total Posts" value={stats.posts} href="/admin/blog" color="emerald" />
                <StatCard icon={FiFileText} label="Published Posts" value={stats.published} href="/admin/blog" color="purple" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Link
                    href="/admin/projects/new"
                    className="flex items-center gap-3 p-4 bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors group"
                >
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20">
                        <FiPlus className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-sm font-space-grotesk font-medium text-white group-hover:text-blue-400 transition-colors">
                            New Project
                        </div>
                        <div className="text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-widest">
                            Add a case study
                        </div>
                    </div>
                </Link>
                <Link
                    href="/admin/blog/new"
                    className="flex items-center gap-3 p-4 bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors group"
                >
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20">
                        <FiPlus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-sm font-space-grotesk font-medium text-white group-hover:text-emerald-400 transition-colors">
                            New Blog Post
                        </div>
                        <div className="text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-widest">
                            Write an article
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-5">
                    <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-4">
                        Recent Projects
                    </h3>
                    <div className="space-y-3">
                        {recentProjects.length === 0 ? (
                            <p className="text-sm text-neutral-600 font-jetbrains-mono">No projects yet</p>
                        ) : (
                            recentProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/admin/projects/${project.id}/edit`}
                                    className="flex items-center justify-between py-2 border-b border-neutral-800/50 hover:bg-white/5 px-2 -mx-2 transition-colors"
                                >
                                    <div>
                                        <div className="text-sm text-neutral-300 font-space-grotesk">{project.client || project.title}</div>
                                        <div className="text-[10px] font-jetbrains-mono text-neutral-600">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className="text-neutral-600">→</span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-neutral-900/50 border border-neutral-800 p-5">
                    <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-4">
                        Recent Blog Posts
                    </h3>
                    <div className="space-y-3">
                        {recentPosts.length === 0 ? (
                            <p className="text-sm text-neutral-600 font-jetbrains-mono">No posts yet</p>
                        ) : (
                            recentPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/admin/blog/${post.id}/edit`}
                                    className="flex items-center justify-between py-2 border-b border-neutral-800/50 hover:bg-white/5 px-2 -mx-2 transition-colors"
                                >
                                    <div>
                                        <div className="text-sm text-neutral-300 font-space-grotesk">{post.title}</div>
                                        <div className="text-[10px] font-jetbrains-mono text-neutral-600">
                                            {post.published ? "Published" : "Draft"} • {new Date(post.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-jetbrains-mono uppercase px-2 py-0.5 ${post.published ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border border-amber-500/20"}`}>
                                        {post.published ? "Live" : "Draft"}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
