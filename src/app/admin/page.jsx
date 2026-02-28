"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiBriefcase, FiFileText, FiPlus, FiArrowRight, FiCheckCircle, FiArchive, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "@/lib/auth/AuthProvider";
import { CornerFrame } from "@/components/ui/CornerFrame";
import Modal from "@/components/ui/Modal";
import ProjectForm from "@/components/admin/ProjectForm";
import BlogPostForm from "@/components/admin/BlogPostForm";
import TestimonialForm from "@/components/admin/TestimonialForm";
import RequestTimeline from "@/components/ui/RequestTimeline";
import DashboardStats from "@/components/features/admin/DashboardStats";
import DashboardQuickActions from "@/components/features/admin/DashboardQuickActions";
import DashboardRecentProjects from "@/components/features/admin/DashboardRecentProjects";
import DashboardRecentTestimonials from "@/components/features/admin/DashboardRecentTestimonials";
import DashboardRecentPosts from "@/components/features/admin/DashboardRecentPosts";
import { useProjectStats } from "@/lib/hooks/useProjectStats";
import { useRequests } from "@/lib/hooks/useRequests";

const REQUEST_STAGES = ["discover", "define", "design", "develop", "deliver", "maintain"];

export default function AdminDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const firstName =
        user?.user_metadata?.full_name?.split(" ")?.[0] ||
        user?.email?.split("@")[0] ||
        null;
    const { stats, recentProjects, recentPosts, recentTestimonials, loading, refreshStats } = useProjectStats();
    const { requests: initialRequests, loading: requestsLoading, refreshRequests, updateRequestStatus } = useRequests("/api/admin/requests");
    const [requests, setRequests] = useState([]);
    const [projectModal, setProjectModal] = useState({ open: false, mode: "create", id: null });
    const [blogModal, setBlogModal] = useState({ open: false, mode: "create", id: null });
    const [testimonialModal, setTestimonialModal] = useState({ open: false, mode: "create", id: null });

    useEffect(() => {
        if (initialRequests) {
            setRequests(initialRequests.filter(r => r.status !== 'archived'));
        }
    }, [initialRequests]);

    return (
        <div className="space-y-6 sm:space-y-8">
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
            <DashboardStats stats={stats} />

            {/* Quick Actions */}
            <DashboardQuickActions
                onNewProject={() => setProjectModal({ open: true, mode: "create", id: null })}
                onNewTestimonial={() => setTestimonialModal({ open: true, mode: "create", id: null })}
                onNewBlogPost={() => setBlogModal({ open: true, mode: "create", id: null })}
            />

            {/* Recent Activity + Track Request */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Recent Projects */}
                <DashboardRecentProjects
                    projects={recentProjects}
                    loading={loading}
                    onNewProject={() => setProjectModal({ open: true, mode: "create", id: null })}
                    onEditProject={(id) => setProjectModal({ open: true, mode: "edit", id })}
                />

                {/* Recent Testimonials - NEW BLOCK */}
                <DashboardRecentTestimonials
                    testimonials={recentTestimonials}
                    loading={loading}
                    onNewTestimonial={() => setTestimonialModal({ open: true, mode: "create", id: null })}
                    onEditTestimonial={(id) => setTestimonialModal({ open: true, mode: "edit", id })}
                />

                {/* Recent Posts */}
                <DashboardRecentPosts
                    posts={recentPosts}
                    loading={loading}
                    onNewPost={() => setBlogModal({ open: true, mode: "create", id: null })}
                    onEditPost={(id) => setBlogModal({ open: true, mode: "edit", id })}
                />

                {/* Track Request */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                    className="lg:col-span-3"
                >
                    <CornerFrame
                        className="bg-white border border-neutral-200 p-4 lg:p-5 h-full flex flex-col"
                        bracketClassName="w-2.5 h-2.5 border-neutral-400"
                    >
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                Track Requests
                            </h3>
                            <Link href="/admin/requests" className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                                View all →
                            </Link>
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
                            <div className="overflow-y-auto max-h-[300px] lg:max-h-[320px] pr-2 scrollbar-thin scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {requests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="flex flex-col gap-2.5 sm:gap-3 py-3 px-3 sm:px-4 border border-neutral-100 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-sm group relative"
                                        >
                                            <div className="pr-12">
                                                <div className="text-sm font-space-grotesk font-bold text-neutral-900 truncate">
                                                    {request.company || request.name}
                                                </div>
                                                <div className="text-[10px] font-jetbrains-mono text-neutral-500 mt-0.5 truncate">
                                                    {request.email}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto pt-1">
                                                <span className={`
                                                    text-[9px] font-jetbrains-mono uppercase px-1.5 py-0.5 rounded shrink-0
                                                    border border-neutral-300 bg-white text-neutral-700
                                                `}>
                                                    {request.status || "discover"}
                                                </span>
                                                <div className="text-[10px] font-jetbrains-mono text-neutral-400">
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Actions Hover Overlay */}
                                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-neutral-100 sm:bg-neutral-100/50 sm:backdrop-blur-sm p-1 rounded-sm border border-neutral-200/50">
                                                {request.status !== 'completed' && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            await updateRequestStatus(request.id, 'completed');
                                                            // We no longer need manual state update here since refreshRequests will handle it
                                                            // but since we derive local 'requests' state here, we update it too
                                                            setRequests(prev => prev.filter(r => r.id !== request.id));
                                                        }}
                                                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-white rounded transition-colors"
                                                        title="Mark Complete"
                                                    >
                                                        <FiCheckCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); updateRequestStatus(request.id, 'archived'); }}
                                                    className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-white rounded transition-colors"
                                                    title="Archive"
                                                >
                                                    <FiArchive className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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