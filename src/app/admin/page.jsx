"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiBriefcase, FiFileText, FiPlus, FiArrowRight, FiCheckCircle, FiArchive, FiMessageSquare } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { CornerFrame } from "@/components/ui/CornerFrame";
import Modal from "@/components/ui/Modal";
import ProjectForm from "@/components/admin/ProjectForm";
import BlogPostForm from "@/components/admin/BlogPostForm";
import TestimonialForm from "@/components/admin/TestimonialForm";
import RequestTimeline from "@/components/ui/RequestTimeline";

const REQUEST_STAGES = ["discover", "define", "design", "develop", "deliver", "maintain"];

function StatCard({ icon: Icon, label, value, href, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link href={href}>
                <CornerFrame
                    className="p-2.5 sm:p-3 bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 h-full"
                    bracketClassName="w-2 h-2 border-neutral-400"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-1.5 bg-neutral-100 border border-neutral-200 rounded-sm">
                            <Icon className="w-3.5 h-3.5 text-neutral-700" />
                        </div>
                    </div>
                    <div className="font-space-grotesk text-lg sm:text-xl font-medium text-neutral-900 mb-0.5">
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

function QuickActionCard({ onClick, title, subtitle, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + index * 0.05 }}
        >
            <button
                type="button"
                onClick={onClick}
                className="w-full text-left"
            >
                <CornerFrame
                    className="p-3 bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200 group h-full"
                    bracketClassName="w-2 h-2 border-neutral-400"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-neutral-100 border border-neutral-200 rounded-sm">
                            <FiPlus className="w-3.5 h-3.5 text-neutral-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-space-grotesk text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                                {title}
                            </div>
                            <div className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                {subtitle}
                            </div>
                        </div>
                        <FiArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors shrink-0" />
                    </div>
                </CornerFrame>
            </button>
        </motion.div>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const firstName =
        user?.user_metadata?.full_name?.split(" ")?.[0] ||
        user?.email?.split("@")[0] ||
        null;
    const [stats, setStats] = useState({ projects: null, posts: null, testimonials: null });
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [recentTestimonials, setRecentTestimonials] = useState([]);
    const [requests, setRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [loading, setLoading] = useState(true);
    const [projectModal, setProjectModal] = useState({ open: false, mode: "create", id: null });
    const [blogModal, setBlogModal] = useState({ open: false, mode: "create", id: null });
    const [testimonialModal, setTestimonialModal] = useState({ open: false, mode: "create", id: null });

    const refreshStats = async () => {
        const supabase = createClient();
        try {
            const [projectsRes, postsRes, testiRes] = await Promise.all([
                supabase.from("projects").select("id, client, title, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
                supabase.from("blog_posts").select("id, title, published, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
                supabase.from("testimonials").select("id, client, company, content, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
            ]);

            setStats((s) => ({
                ...s,
                projects: projectsRes.count ?? 0,
                posts: postsRes.count ?? 0,
                testimonials: testiRes.count ?? 0,
            }));
            setRecentProjects(projectsRes.data || []);
            setRecentPosts(postsRes.data || []);
            setRecentTestimonials(testiRes.data || []);
        } catch (error) {
            console.error("Failed to refresh stats:", error);
        }
    };

    useEffect(() => {
        async function fetchRequests() {
            try {
                const res = await fetch("/api/admin/requests");
                const json = await res.json();
                if (res.ok) {
                    setRequests((json.data || []).filter(r => r.status !== 'archived'));
                } else {
                    console.error("Failed to fetch requests:", json.error);
                }
            } catch (error) {
                console.error("Error fetching requests:", error);
            } finally {
                setRequestsLoading(false);
            }
        }
        fetchRequests();
    }, []);

    const updateRequestStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/admin/requests/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                const { data } = await res.json();
                if (status === 'archived') {
                    setRequests((prev) => prev.filter((r) => r.id !== id));
                } else {
                    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: data.status } : r)));
                }
            } else {
                console.error("Failed to update request status");
            }
        } catch (error) {
            console.error("Error updating request status:", error);
        }
    };

    useEffect(() => {
        async function fetchStats() {
            const supabase = createClient();

            const [projectsRes, postsRes, testiRes] = await Promise.all([
                supabase.from("projects").select("id, client, title, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
                supabase.from("blog_posts").select("id, title, published, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
                supabase.from("testimonials").select("id, client, company, content, created_at", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
            ]);

            setStats({
                projects: projectsRes.count ?? 0,
                posts: postsRes.count ?? 0,
                testimonials: testiRes.count ?? 0,
            });
            setRecentProjects(projectsRes.data || []);
            setRecentPosts(postsRes.data || []);
            setRecentTestimonials(testiRes.data || []);
            setLoading(false);
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-3 sm:space-y-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
            >
                <div>
                    <h1 className="font-space-grotesk text-xl sm:text-2xl font-medium text-neutral-900 tracking-tight">
                        Welcome back{firstName && <span className="text-neutral-500">, {firstName}</span>}
                    </h1>
                    <p className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <StatCard icon={FiBriefcase} label="Projects" value={stats.projects} href="/admin/projects" index={0} />
                <StatCard icon={FiMessageSquare} label="Testimonials" value={stats.testimonials} href="/admin/testimonials" index={2} />
                <StatCard icon={FiFileText} label="Posts" value={stats.posts} href="/admin/blog" index={1} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
                <QuickActionCard onClick={() => setProjectModal({ open: true, mode: "create", id: null })} title="New Project" subtitle="Add case study" index={0} />
                <QuickActionCard onClick={() => setTestimonialModal({ open: true, mode: "create", id: null })} title="New Testimonial" subtitle="Add client review" index={1} />
                <QuickActionCard onClick={() => setBlogModal({ open: true, mode: "create", id: null })} title="New Blog Post" subtitle="Write article" index={2} />
            </div>

            {/* Recent Activity + Track Request */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
                {/* Recent Projects */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <CornerFrame
                        className="bg-white border border-neutral-200 p-3 h-full flex flex-col"
                        bracketClassName="w-2.5 h-2.5 border-neutral-400"
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                Recent Projects
                            </h3>
                            <Link href="/admin/projects" className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-2 overflow-hidden">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-10 bg-neutral-100 animate-pulse rounded-sm" />
                                ))}
                            </div>
                        ) : recentProjects.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-xs text-neutral-500 font-jetbrains-mono">No projects</p>
                                <button type="button" onClick={() => setProjectModal({ open: true, mode: "create", id: null })} className="text-xs text-neutral-700 hover:text-neutral-900 underline mt-1 inline-block">
                                    Add project
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[180px] pr-1 space-y-1 dash-scroll">
                                {recentProjects.map((project) => (
                                    <button
                                        key={project.id}
                                        type="button"
                                        onClick={() => setProjectModal({ open: true, mode: "edit", id: project.id })}
                                        className="w-full flex items-center justify-between py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group text-left"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-space-grotesk text-neutral-900 truncate">
                                                {project.client || project.title}
                                            </div>
                                            <div className="text-[10px] font-jetbrains-mono text-neutral-500">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <FiArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors shrink-0 ml-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </CornerFrame>
                </motion.div>

                {/* Recent Testimonials - NEW BLOCK */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 }}
                >
                    <CornerFrame
                        className="bg-white border border-neutral-200 p-3 h-full flex flex-col"
                        bracketClassName="w-2.5 h-2.5 border-neutral-400"
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                Recent Testimonials
                            </h3>
                            <Link href="/admin/testimonials" className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-2 overflow-hidden">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-10 bg-neutral-100 animate-pulse rounded-sm" />
                                ))}
                            </div>
                        ) : recentTestimonials.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-xs text-neutral-500 font-jetbrains-mono">No testimonials</p>
                                <button type="button" onClick={() => setTestimonialModal({ open: true, mode: "create", id: null })} className="text-xs text-neutral-700 hover:text-neutral-900 underline mt-1 inline-block">
                                    Add testimonial
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[180px] pr-1 space-y-1 dash-scroll">
                                {recentTestimonials.map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setTestimonialModal({ open: true, mode: "edit", id: t.id })}
                                        className="w-full flex items-center justify-between py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group text-left"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-space-grotesk text-neutral-900 truncate">
                                                {t.client} <span className="text-neutral-500">({t.company})</span>
                                            </div>
                                            <div className="text-[10px] font-jetbrains-mono text-neutral-500 truncate mt-0.5">
                                                "{t.content}"
                                            </div>
                                        </div>
                                        <FiArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors shrink-0 ml-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </CornerFrame>
                </motion.div>

                {/* Recent Posts */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <CornerFrame
                        className="bg-white border border-neutral-200 p-3 h-full flex flex-col"
                        bracketClassName="w-2.5 h-2.5 border-neutral-400"
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                Recent Blog Posts
                            </h3>
                            <Link href="/admin/blog" className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-2 overflow-hidden">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-10 bg-neutral-100 animate-pulse rounded-sm" />
                                ))}
                            </div>
                        ) : recentPosts.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-xs text-neutral-500 font-jetbrains-mono">No posts</p>
                                <button type="button" onClick={() => setBlogModal({ open: true, mode: "create", id: null })} className="text-xs text-neutral-700 hover:text-neutral-900 underline mt-1 inline-block">
                                    Write post
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[180px] pr-1 space-y-1 dash-scroll">
                                {recentPosts.map((post) => (
                                    <button
                                        key={post.id}
                                        type="button"
                                        onClick={() => setBlogModal({ open: true, mode: "edit", id: post.id })}
                                        className="w-full flex items-center justify-between py-2 px-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group text-left"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-space-grotesk text-neutral-900 truncate">
                                                {post.title}
                                            </div>
                                            <div className="text-[10px] font-jetbrains-mono text-neutral-500">
                                                {post.published ? "Published" : "Draft"} • {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <span className={`
                                            text-[9px] font-jetbrains-mono uppercase px-1.5 py-0.5 rounded shrink-0 ml-2
                                            border border-neutral-300
                                            ${post.published ? "bg-white text-neutral-700" : "bg-neutral-100 text-neutral-600"}
                                        `}>
                                            {post.published ? "Live" : "Draft"}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CornerFrame>
                </motion.div>

                {/* Track Request */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                    className="lg:col-span-3"
                >
                    <CornerFrame
                        className="bg-white border border-neutral-200 p-3 h-full flex flex-col"
                        bracketClassName="w-2.5 h-2.5 border-neutral-400"
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                Track Requests
                            </h3>
                        </div>

                        {requestsLoading ? (
                            <div className="space-y-2 overflow-hidden">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-10 bg-neutral-100 animate-pulse rounded-sm" />
                                ))}
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-xs text-neutral-500 font-jetbrains-mono">No requests yet</p>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[180px] pr-1 space-y-2 dash-scroll">
                                {requests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="py-2 px-2.5 bg-neutral-50 rounded-sm border border-neutral-100"
                                    >
                                        <div className="mb-2">
                                            <div className="text-xs font-space-grotesk text-neutral-900 truncate">
                                                {request.company || request.name}
                                            </div>
                                            <div className="text-[10px] font-jetbrains-mono text-neutral-500 mt-0.5">
                                                {new Date(request.created_at).toLocaleDateString()} • {request.email}
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-neutral-100">
                                            <RequestTimeline
                                                currentStage={request.status || "discover"}
                                                interactive
                                                compact
                                                onStageChange={(stage) => updateRequestStatus(request.id, stage)}
                                            />
                                            {/* Actions */}
                                            <div className="mt-3 flex items-center justify-end gap-2">
                                                {request.status !== 'completed' && (
                                                    <button
                                                        onClick={() => updateRequestStatus(request.id, 'completed')}
                                                        className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
                                                    >
                                                        <FiCheckCircle className="w-3 h-3" />
                                                        Mark Complete
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => updateRequestStatus(request.id, 'archived')}
                                                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded transition-colors"
                                                >
                                                    <FiArchive className="w-3 h-3" />
                                                    Archive
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CornerFrame>
                </motion.div>
            </div>

            {/* Project Modal */}
            <Modal
                isOpen={projectModal.open}
                onClose={() => setProjectModal((p) => ({ ...p, open: false }))}
                title={projectModal.mode === "edit" ? "Edit Project" : "New Project"}
            >
                <ProjectForm
                    mode={projectModal.mode}
                    embedded
                    editId={projectModal.id}
                    onClose={() => setProjectModal((p) => ({ ...p, open: false }))}
                    onSuccess={() => {
                        setProjectModal((p) => ({ ...p, open: false }));
                        refreshStats();
                    }}
                />
            </Modal>

            {/* Blog Modal */}
            <Modal
                isOpen={blogModal.open}
                onClose={() => setBlogModal((p) => ({ ...p, open: false }))}
                title={blogModal.mode === "edit" ? "Edit Blog Post" : "New Blog Post"}
            >
                <BlogPostForm
                    mode={blogModal.mode}
                    embedded
                    editId={blogModal.id}
                    onClose={() => setBlogModal((p) => ({ ...p, open: false }))}
                    onSuccess={() => {
                        setBlogModal((p) => ({ ...p, open: false }));
                        refreshStats();
                    }}
                />
            </Modal>

            {/* Testimonial Modal */}
            <Modal
                isOpen={testimonialModal.open}
                onClose={() => setTestimonialModal((p) => ({ ...p, open: false }))}
                title={testimonialModal.mode === "edit" ? "Edit Testimonial" : "New Testimonial"}
            >
                <TestimonialForm
                    mode={testimonialModal.mode}
                    embedded
                    editId={testimonialModal.id}
                    onClose={() => setTestimonialModal((p) => ({ ...p, open: false }))}
                    onSuccess={() => {
                        setTestimonialModal((p) => ({ ...p, open: false }));
                        refreshStats();
                    }}
                />
            </Modal>
        </div>
    );
}