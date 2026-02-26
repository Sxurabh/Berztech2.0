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
                        <div className="h-px w-4 bg-neutral-900 border-b-2 border-neutral-900" />
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 font-bold">
                            Testimonials
                        </span>
                    </div>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight uppercase">
                        Manage Reviews
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setModal({ open: true, mode: "create", id: null })}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors border-2 border-neutral-900 shadow-[2px_2px_0px_#171717] hover:shadow-[4px_4px_0px_#171717] hover:-translate-y-0.5"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add New
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-4 w-32 bg-neutral-200 border-2 border-neutral-300 rounded-none mb-4"></div>
                        <div className="h-64 w-full max-w-2xl bg-neutral-100 border-2 border-neutral-300 rounded-none"></div>
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
                            className="bg-white border-2 border-neutral-900 h-full flex flex-col shadow-[2px_2px_0px_#171717] hover:shadow-[6px_6px_0px_#171717] hover:-translate-y-1 transition-all"
                        >
                            <div className="p-5 flex flex-col h-full relative">
                                {/* Header: Author & Company */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 bg-neutral-100 overflow-hidden shrink-0 border-2 border-neutral-900 shadow-[2px_2px_0px_#171717]">
                                            {testimonial.image ? (
                                                <Image
                                                    src={testimonial.image}
                                                    alt={testimonial.client}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-900 font-bold bg-neutral-100">
                                                    {testimonial.client?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-jetbrains-mono text-sm font-bold text-neutral-900 truncate max-w-[120px]">
                                                {testimonial.client}
                                            </h3>
                                            <p className="text-xs font-jetbrains-mono font-medium text-neutral-500 truncate max-w-[120px]">
                                                {testimonial.role ? `${testimonial.role} at ` : ''}{testimonial.company}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setModal({ open: true, mode: "edit", id: testimonial.id })}
                                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border-2 border-transparent hover:border-neutral-900 hover:shadow-[2px_2px_0px_#171717] transition-all"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(testimonial.id)}
                                            className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-500 hover:shadow-[2px_2px_0px_#ef4444] transition-all"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <blockquote className="flex-1 mb-6">
                                    <p className="text-neutral-700 font-space-grotesk text-sm leading-relaxed line-clamp-4 font-medium italic border-l-4 border-neutral-900 pl-3">
                                        "{testimonial.content}"
                                    </p>
                                </blockquote>

                                {/* Footer: Metrics/Tags */}
                                <div className="pt-4 border-t-2 border-neutral-900 mt-auto flex items-center justify-between">
                                    {testimonial.metric ? (
                                        <div className="flex flex-col">
                                            <span className="font-jetbrains-mono font-bold text-neutral-900 text-sm">{testimonial.metric}</span>
                                            <span className="font-jetbrains-mono text-[9px] font-bold uppercase tracking-widest text-neutral-500">{testimonial.metric_label}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-neutral-400 font-jetbrains-mono uppercase tracking-widest">No metric</span>
                                    )}

                                    <span className={`
                                        px-2.5 py-1 text-[9px] font-jetbrains-mono font-bold uppercase tracking-widest border-2 shadow-[1px_1px_0px_#171717]
                                        ${testimonial.featured ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-900 border-neutral-900'}
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
