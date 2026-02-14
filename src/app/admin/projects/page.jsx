"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit2, FiTrash2, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";
import { projectsApi } from "@/lib/api/client";
import DataTable from "@/components/admin/DataTable";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import Modal from "@/components/ui/Modal";
import ProjectForm from "@/components/admin/ProjectForm";

export default function AdminProjectsPage() {
    const queryClient = useQueryClient();
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [bulkDelete, setBulkDelete] = useState(false);
    const [modal, setModal] = useState({ open: false, mode: "create", id: null });

    // Fetch Projects using React Query
    const { data: projects = [], isLoading: loading, error } = useQuery({
        queryKey: ["projects"],
        queryFn: projectsApi.list,
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: projectsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Project deleted");
            setDeleteTarget(null);
        },
        onError: (err) => {
            toast.error("Failed to delete project: " + err.message);
        },
    });

    const deleting = deleteMutation.isPending;

    // Handle single delete
    async function handleDelete() {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id);
    }

    // Handle bulk delete
    async function handleDeleteAll() {
        try {
            await Promise.all(projects.map((p) => projectsApi.delete(p.id)));
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success(`Deleted ${projects.length} projects`);
            setBulkDelete(false);
        } catch (err) {
            toast.error("Failed to delete all projects");
        }
    }

    const handleSuccess = () => {
        setModal({ open: false, mode: "create", id: null });
        queryClient.invalidateQueries({ queryKey: ["projects"] });
    };

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                Failed to load projects: {error.message}
            </div>
        );
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
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setModal({ open: true, mode: "create", id: null })}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-neutral-900 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        New Project
                    </button>
                    {projects.length > 0 && (
                        <button
                            onClick={() => setBulkDelete(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-500/30 text-red-400 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-red-500/10 transition-colors"
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
                    data={projects}
                    searchKey="client"
                    emptyMessage="No projects yet. Create your first project!"
                    actions={(item) => (
                        <>
                            <button
                                onClick={() => setModal({ open: true, mode: "edit", id: item.id })}
                                className="p-2 text-neutral-500 hover:text-white hover:bg-white/10 transition-colors"
                                title="Edit"
                            >
                                <FiEdit2 className="w-4 h-4" />
                            </button>
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
                isOpen={!!deleteTarget || bulkDelete}
                onClose={() => { setDeleteTarget(null); setBulkDelete(false); }}
                onConfirm={bulkDelete ? handleDeleteAll : handleDelete}
                itemName={bulkDelete ? `All ${projects.length} Projects` : "Project"}
                loading={deleting}
            />

            <Modal
                isOpen={modal.open}
                onClose={() => setModal((p) => ({ ...p, open: false }))}
                title={modal.mode === "edit" ? "Edit Project" : "New Project"}
            >
                <ProjectForm
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
