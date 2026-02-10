"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiPlus, FiEdit2, FiTrash2, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import DataTable from "@/components/admin/DataTable";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        setLoading(true);
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Project deleted");
            setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            toast.error("Failed to delete project");
        } finally {
            setDeleting(false);
        }
    }

    const columns = [
        {
            key: "client",
            label: "Client",
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-space-grotesk text-white font-medium">{item.client}</span>
                    {item.featured && <FiStar className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </div>
            ),
        },
        {
            key: "title",
            label: "Title",
            sortable: true,
            render: (item) => (
                <span className="text-sm text-neutral-400 line-clamp-1">{item.title}</span>
            ),
        },
        {
            key: "category",
            label: "Category",
            sortable: true,
            render: (item) => (
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 px-2 py-1 bg-neutral-800/50 border border-neutral-700">
                    {item.category}
                </span>
            ),
        },
        {
            key: "year",
            label: "Year",
            sortable: true,
            className: "hidden sm:table-cell",
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-px w-4 bg-neutral-700" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                            Projects
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-white tracking-tight">
                        Manage Projects
                    </h1>
                </div>
                <Link
                    href="/admin/projects/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-900 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-colors"
                >
                    <FiPlus className="w-4 h-4" />
                    New Project
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <svg className="animate-spin h-8 w-8 text-neutral-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={projects}
                    searchKey="client"
                    emptyMessage="No projects yet. Create your first project!"
                    actions={(item) => (
                        <>
                            <Link
                                href={`/admin/projects/${item.id}/edit`}
                                className="p-2 text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                                title="Edit"
                            >
                                <FiEdit2 className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => setDeleteTarget(item)}
                                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                />
            )}

            <DeleteConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                itemName="Project"
                loading={deleting}
            />
        </div>
    );
}
