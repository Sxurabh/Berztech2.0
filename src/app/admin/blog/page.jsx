"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import DataTable from "@/components/admin/DataTable";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Modal from "@/components/ui/Modal";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default function AdminBlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [bulkDelete, setBulkDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [modal, setModal] = useState({ open: false, mode: "create", id: null });

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

    async function handleDeleteAll() {
        setDeleting(true);
        try {
            const results = await Promise.allSettled(
                posts.map((post) => fetch(`/api/blog/${post.id}`, { method: "DELETE" }).then(res => {
                    if (!res.ok) throw new Error(`Failed to delete ${post.id}`);
                    return res;
                }))
            );

            const successes = results.filter(r => r.status === 'fulfilled');
            const failures = results.filter(r => r.status === 'rejected');

            if (failures.length > 0) {
                console.error("Some posts failed to delete:", failures);
                toast.error(`Deleted ${successes.length} posts. Failed to delete ${failures.length}.`);
                fetchPosts(); // Refresh to show what remains
            } else {
                toast.success(`Deleted ${posts.length} posts`);
                setPosts([]);
            }
            setBulkDelete(false);
        } catch (err) {
            console.error(err);
            toast.error("Critical error during bulk delete");
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

    const handleSuccess = () => {
        setModal({ open: false, mode: "create", id: null });
        fetchPosts();
    };

    const columns = [
        {
            key: "title",
            label: "Title",
            sortable: true,
            render: (item) => (
                <div>
                    <span className="text-sm font-space-grotesk text-neutral-900 font-bold line-clamp-1">
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
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600 px-2 py-1 bg-neutral-100/50 rounded-sm border border-neutral-200">
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
                    className={`text-[10px] font-jetbrains-mono uppercase tracking-widest px-2 py-0.5 rounded-sm border ${item.published
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-amber-700 bg-amber-50 border-amber-200"
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
                        <div className="h-px w-4 bg-neutral-900 border-b border-neutral-200" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-medium">
                            Blog
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                        Manage Blog Posts
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setModal({ open: true, mode: "create", id: null })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors rounded-sm shadow-sm"
                    >
                        <FiPlus className="w-4 h-4" />
                        New Post
                    </button>
                    {posts.length > 0 && (
                        <button
                            onClick={() => setBulkDelete(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 font-jetbrains-mono text-xs uppercase tracking-widest font-medium hover:bg-red-50 hover:border-red-300 transition-colors rounded-sm shadow-sm"
                        >
                            <FiTrash2 className="w-4 h-4" />
                            Delete All
                        </button>
                    )}
                </div>
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
                                className={`p-1.5 rounded-sm transition-colors ${item.published
                                    ? "text-emerald-700 hover:bg-emerald-50"
                                    : "text-amber-700 hover:bg-amber-50"
                                    }`}
                                title={item.published ? "Unpublish" : "Publish"}
                            >
                                {item.published ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setModal({ open: true, mode: "edit", id: item.id })}
                                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-sm transition-colors"
                                title="Edit"
                            >
                                <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setDeleteTarget(item)}
                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                title="Delete"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                />
            )}

            <DeleteConfirmModal
                isOpen={!!deleteTarget || bulkDelete}
                onClose={() => { setDeleteTarget(null); setBulkDelete(false); }}
                onConfirm={bulkDelete ? handleDeleteAll : handleDelete}
                itemName={bulkDelete ? `All ${posts.length} Blog Posts` : "Blog Post"}
                loading={deleting}
            />

            <Modal
                isOpen={modal.open}
                onClose={() => setModal((p) => ({ ...p, open: false }))}
                title={modal.mode === "edit" ? "Edit Blog Post" : "New Blog Post"}
            >
                <BlogPostForm
                    mode={modal.mode}
                    embedded
                    editId={modal.id}
                    onClose={() => setModal((p) => ({ ...p, open: false }))}
                    onSuccess={handleSuccess}
                />
            </Modal>
        </div>
    );
}
