"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit2, FiTrash2, FiMessageSquare } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { testimonialsApi } from "@/lib/api/client";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import TestimonialForm from "@/components/admin/TestimonialForm";
import DataTable from "@/components/admin/DataTable";

export default function AdminTestimonialsPage() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState({ open: false, mode: "create", id: null });

    // Fetch Testimonials
    const { data: testimonials = [], isLoading, error } = useQuery({
        queryKey: ["testimonials"],
        queryFn: testimonialsApi.list,
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: testimonialsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(["testimonials"]);
            toast.success("Testimonial deleted successfully");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete testimonial");
        },
    });

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this testimonial?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleSuccess = () => {
        setModal({ open: false, mode: "create", id: null });
        queryClient.invalidateQueries(["testimonials"]);
    };

    if (error) {
        return (
            <div className="p-8 text-center border-2 border-red-500 bg-red-50 text-red-600 shadow-[4px_4px_0px_#ef4444]">
                <h3 className="font-space-grotesk font-bold mb-1 uppercase tracking-wider">Failed to load testimonials</h3>
                <p className="text-sm font-jetbrains-mono mb-4">{error.message}</p>
                <button
                    onClick={() => queryClient.invalidateQueries(["testimonials"])}
                    className="inline-flex items-center px-4 py-2 bg-white border-2 border-red-500 text-red-600 font-jetbrains-mono text-xs uppercase tracking-widest font-bold shadow-[2px_2px_0px_#ef4444] hover:shadow-[4px_4px_0px_#ef4444] hover:-translate-y-0.5 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // We provide dummy columns so mobile card view of datatable can structure the fields safely, 
    // though desktop uses renderGridItem
    const columns = [
        { key: "client", label: "Client", sortable: true },
        { key: "company", label: "Company", sortable: true },
        { key: "featured", label: "Featured" }
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-px w-4 bg-neutral-900 border-b border-neutral-200" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-medium">
                            Testimonials
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                        Manage Reviews
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setModal({ open: true, mode: "create", id: null })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors rounded-sm shadow-sm"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add New
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-32 bg-neutral-200 rounded-sm mb-4"></div>
                        <div className="h-64 w-full max-w-2xl bg-neutral-100 rounded-sm"></div>
                    </div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={testimonials}
                    searchKey="client"
                    emptyMessage="No testimonials found. Start by adding a client success story."
                    emptyIcon={<FiMessageSquare />}
                    gridView={true}
                    renderGridItem={(testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-white border border-neutral-200 rounded-sm h-full flex flex-col shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            <div className="p-5 flex flex-col h-full">
                                {/* Header: Author & Company */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center justify-between w-full pr-12">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 bg-neutral-100 rounded-full overflow-hidden shrink-0 border border-neutral-200">
                                                {testimonial.image ? (
                                                    <Image
                                                        src={testimonial.image}
                                                        alt={testimonial.client}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-600 font-medium bg-neutral-100 text-sm">
                                                        {testimonial.client?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-space-grotesk text-sm font-bold text-neutral-900 truncate max-w-[140px]">
                                                    {testimonial.client}
                                                </h3>
                                                <p className="text-[10px] font-jetbrains-mono text-neutral-500 truncate max-w-[140px]">
                                                    {testimonial.role ? `${testimonial.role} at ` : ''}{testimonial.company}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Hover Overlay */}
                                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-neutral-50/80 backdrop-blur-sm p-1 rounded-sm border border-neutral-200/50">
                                        <button
                                            onClick={() => setModal({ open: true, mode: "edit", id: testimonial.id })}
                                            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-white rounded-sm transition-colors"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(testimonial.id)}
                                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-white rounded-sm transition-colors"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <blockquote className="flex-1 mb-6">
                                    <p className="text-neutral-600 font-space-grotesk text-sm leading-relaxed line-clamp-4 italic">
                                        "{testimonial.content}"
                                    </p>
                                </blockquote>

                                {/* Footer: Metrics/Tags */}
                                <div className="pt-4 border-t border-neutral-100 mt-auto flex items-center justify-between">
                                    {testimonial.metric ? (
                                        <div className="flex flex-col">
                                            <span className="font-jetbrains-mono font-medium text-neutral-900 text-xs">{testimonial.metric}</span>
                                            <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-neutral-400">{testimonial.metric_label}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-neutral-400 font-jetbrains-mono uppercase tracking-widest">No metric</span>
                                    )}

                                    <span className={`
                                        px-2 py-0.5 text-[9px] font-jetbrains-mono uppercase tracking-widest rounded-sm border
                                        ${testimonial.featured ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-600 border-neutral-200'}
                                    `}>
                                        {testimonial.featured ? 'Featured' : 'Standard'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                />
            )}

            <Modal
                isOpen={modal.open}
                onClose={() => setModal((p) => ({ ...p, open: false }))}
                title={modal.mode === "edit" ? "Edit Testimonial" : "New Testimonial"}
            >
                <TestimonialForm
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
