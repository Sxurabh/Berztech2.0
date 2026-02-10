"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/DataTable";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export default function AdminBlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        setLoading(true);
        try {
            const res = await fetch("/api/blog");
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/blog/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Post deleted");
            setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            toast.error("Failed to delete post");
        } finally {
            setDeleting(false);
        }
    }

    async function togglePublish(post) {
        try {
            const res = await fetch(`/api/blog/${post.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: !post.published }),
            });
            if (!res.ok) throw new Error("Update failed");
            toast.success(post.published ? "Post unpublished" : "Post published!");
            setPosts((prev) =>
                prev.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p))
            );
        } catch (err) {
            toast.error("Failed to update post");
        }
    }

    const columns = [
        {
            key: "title",
            label: "Title",
            sortable: true,
            render: (item) => (
                <div>
                    <span className="text-sm font-space-grotesk text-white font-medium line-clamp-1">
                        {item.title}
                    </span>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-600 mt-0.5">
                        {item.author} • {item.read_time || "—"}
                    </div>
                </div>
            ),
        },
        {
            key: "category",
            label: "Category",
            sortable: true,
            className: "hidden sm:table-cell",
            render: (item) => (
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 px-2 py-1 bg-neutral-800/50 border border-neutral-700">
                    {item.category}
                </span>
            ),
        },
        {
            key: "published",
            label: "Status",
            sortable: true,
            render: (item) => (
                <span
                    className={`text-[10px] font-jetbrains-mono uppercase tracking-widest px-2 py-1 border ${item.published
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        }`}
                >
                    {item.published ? "Published" : "Draft"}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Date",
            sortable: true,
            className: "hidden md:table-cell",
            render: (item) => (
                <span className="text-xs font-jetbrains-mono text-neutral-500">
                    {new Date(item.created_at).toLocaleDateString()}
                </span>
            ),
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
                            Blog
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-white tracking-tight">
                        Manage Blog Posts
                    </h1>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-900 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-colors"
                >
                    <FiPlus className="w-4 h-4" />
                    New Post
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
                    data={posts}
                    searchKey="title"
                    emptyMessage="No blog posts yet. Write your first article!"
                    actions={(item) => (
                        <>
                            <button
                                onClick={() => togglePublish(item)}
                                className={`p-2 transition-colors ${item.published
                                        ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                        : "text-neutral-500 hover:text-amber-400 hover:bg-amber-500/10"
                                    }`}
                                title={item.published ? "Unpublish" : "Publish"}
                            >
                                {item.published ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                            </button>
                            <Link
                                href={`/admin/blog/${item.id}/edit`}
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
                itemName="Blog Post"
                loading={deleting}
            />
        </div>
    );
}
