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
                    <span className="text-sm font-space-grotesk text-neutral-900 font-bold">{item.client}</span>
                    {item.featured && <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />}
                </div>
            ),
        },
        {
            key: "title",
            label: "Title",
            sortable: true,
            render: (item) => (
                <span className="text-sm text-neutral-600 font-medium line-clamp-1">{item.title}</span>
            ),
        },
        {
            key: "category",
            label: "Category",
            sortable: true,
            render: (item) => (
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-900 px-2 py-1 bg-white border-2 border-neutral-900 shadow-[1px_1px_0px_#171717]">
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
                        <div className="h-px w-4 bg-neutral-900 border-b border-neutral-200" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-medium">
                            Projects
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                        Manage Projects
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setModal({ open: true, mode: "create", id: null })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors rounded-sm shadow-sm"
                    >
                        <FiPlus className="w-4 h-4" />
                        New Project
                    </button>
                    {projects.length > 0 && (
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
                    data={projects}
                    searchKey="client"
                    emptyMessage="No projects yet. Create your first project!"
                    actions={(item) => (
                        <>
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
