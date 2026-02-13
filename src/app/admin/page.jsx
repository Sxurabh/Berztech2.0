"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiBriefcase, FiFileText, FiPlus, FiTrendingUp, FiArrowRight } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { CornerFrame } from "@/components/ui/CornerFrame";

function StatCard({ icon: Icon, label, value, href, color = "neutral", index }) {
    const colorMap = {
        neutral: { bg: "bg-neutral-50", border: "border-neutral-200", text: "text-neutral-900", accent: "text-neutral-500" },
        blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", accent: "text-blue-500" },
        emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", accent: "text-emerald-500" },
        purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", accent: "text-purple-500" },
    };
    const colors = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Link href={href}>
                <CornerFrame
                    className={`
                        p-4 sm:p-5 ${colors.bg} border ${colors.border} 
                        hover:shadow-md transition-all duration-300 h-full
                    `}
                    bracketClassName="w-2.5 h-2.5 border-neutral-300"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 bg-white border ${colors.border} rounded-sm`}>
                            <Icon className={`w-4 h-4 ${colors.accent}`} />
                        </div>
                        <FiTrendingUp className={`w-4 h-4 ${colors.accent}`} />
                    </div>
                    <div className={`font-space-grotesk text-2xl sm:text-3xl font-medium ${colors.text} mb-1`}>
                        {value ?? "—"}
                    </div>
                    <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                        {label}
                    </div>
                </CornerFrame>
            </Link>
        </motion.div>
    );
}

function QuickActionCard({ href, icon: Icon, title, subtitle, color = "blue", index }) {
    const colorMap = {
        blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
        emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    };
    const colors = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
        >
            <Link href={href}>
                <CornerFrame
                    className={`
                        p-4 ${colors.bg} border ${colors.border} 
                        hover:shadow-md transition-all duration-300 group h-full
                    `}
                    bracketClassName="w-2.5 h-2.5 border-neutral-300"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white border ${colors.border} rounded-sm`}>
                            <FiPlus className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-space-grotesk text-sm font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">
                                {title}
                            </div>
                            <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                {subtitle}
                            </div>
                        </div>
                        <FiArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                    </div>
                </CornerFrame>
            </Link>
        </motion.div>
    );
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const firstName =
        user?.user_metadata?.full_name?.split(" ")?.[0] ||
        user?.email?.split("@")[0] ||
        null;
    const [stats, setStats] = useState({ projects: null, posts: null, published: null });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-px w-4" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                            Dashboard
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight">
                        Welcome back
                        {firstName && (
                            <span className="text-neutral-500">, {firstName}</span>
                        )}
                    </h1>
                </div>
                <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <StatCard icon={FiBriefcase} label="Total Projects" value={stats.projects} href="/admin/projects" color="blue" index={0} />
                <StatCard icon={FiFileText} label="Total Posts" value={stats.posts} href="/admin/blog" color="emerald" index={1} />
                <StatCard icon={FiFileText} label="Published Posts" value={stats.published} href="/admin/blog" color="purple" index={2} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <QuickActionCard href="/admin/projects/new" title="New Project" subtitle="Add a case study" color="blue" index={0} />
                <QuickActionCard href="/admin/blog/new" title="New Blog Post" subtitle="Write an article" color="emerald" index={1} />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Projects */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <CornerFrame
                        className="bg-white border-neutral-200 p-4 sm:p-5 h-full"
                        bracketClassName="w-3 h-3 border-neutral-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                Recent Projects
                            </h3>
                            <Link href="/admin/projects" className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-sm" />
                                ))}
                            </div>
                        ) : recentProjects.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-neutral-500 font-jetbrains-mono">No projects yet</p>
                                <Link href="/admin/projects/new" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                                    Create your first project
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/admin/projects/${project.id}/edit`}
                                        className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-space-grotesk text-neutral-900 truncate">
                                                {project.client || project.title}
                                            </div>
                                            <div className="text-[10px] font-jetbrains-mono text-neutral-500">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <FiArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CornerFrame>
                </motion.div>

                {/* Recent Posts */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                >
                    <CornerFrame
                        className="bg-white border-neutral-200 p-4 sm:p-5 h-full"
                        bracketClassName="w-3 h-3 border-neutral-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                Recent Blog Posts
                            </h3>
                            <Link href="/admin/blog" className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-sm" />
                                ))}
                            </div>
                        ) : recentPosts.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-sm text-neutral-500 font-jetbrains-mono">No posts yet</p>
                                <Link href="/admin/blog/new" className="text-xs text-emerald-600 hover:underline mt-2 inline-block">
                                    Write your first post
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/admin/blog/${post.id}/edit`}
                                        className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-space-grotesk text-neutral-900 truncate">
                                                {post.title}
                                            </div>
                                            <div className="text-[10px] font-jetbrains-mono text-neutral-500">
                                                {post.published ? "Published" : "Draft"} • {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span className={`
                                            text-[9px] font-jetbrains-mono uppercase px-2 py-1 rounded-sm shrink-0 ml-2
                                            ${post.published
                                                ? "text-emerald-600 bg-emerald-50 border border-emerald-200"
                                                : "text-amber-600 bg-amber-50 border border-amber-200"
                                            }
                                        `}>
                                            {post.published ? "Live" : "Draft"}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CornerFrame>
                </motion.div>
            </div>
        </div>
    );
}