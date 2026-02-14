"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FiPlus, FiEdit2, FiTrash2, FiMessageSquare } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { testimonialsApi } from "@/lib/api/client";
import { CornerFrame } from "@/components/ui/CornerFrame";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import TestimonialForm from "@/components/admin/TestimonialForm";

export default function AdminTestimonialsPage() {
    const queryClient = useQueryClient();
    const [modal, setModal] = useState({ open: false, mode: "create", id: null });

    // Fetch Testimonials
    const { data: testimonials = [], isLoading } = useQuery({
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-neutral-200 rounded mb-4"></div>
                    <div className="h-64 w-full max-w-2xl bg-neutral-100 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-space-grotesk text-2xl font-bold text-neutral-900">
                        Testimonials
                    </h1>
                    <p className="font-jetbrains-mono text-xs text-neutral-500 mt-1">
                        Manage client reviews and success stories
                    </p>
                </div>
                <button
                    onClick={() => setModal({ open: true, mode: "create", id: null })}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white font-jetbrains-mono text-xs uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                    <FiPlus className="w-4 h-4" />
                    Add New
                </button>
            </div>

            {/* List */}
            {testimonials.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-300 rounded-sm bg-neutral-50">
                    <FiMessageSquare className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                    <h3 className="font-space-grotesk text-lg font-medium text-neutral-900">
                        No testimonials found
                    </h3>
                    <p className="text-neutral-500 text-sm mt-1 mb-4">
                        Start by adding your first client success story.
                    </p>
                    <button
                        onClick={() => setModal({ open: true, mode: "create", id: null })}
                        className="text-neutral-900 font-jetbrains-mono text-xs underline hover:text-neutral-700"
                    >
                        Add Testimonial
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <CornerFrame
                            key={testimonial.id}
                            className="bg-white border-neutral-200 h-full flex flex-col"
                            bracketClassName="w-3 h-3 border-neutral-300"
                        >
                            <div className="p-5 flex flex-col h-full relative">

                                {/* Header: Author & Company */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-10 h-10 bg-neutral-100 overflow-hidden shrink-0 rounded-full border border-neutral-100">
                                            {testimonial.image ? (
                                                <Image
                                                    src={testimonial.image}
                                                    alt={testimonial.client}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">
                                                    {testimonial.client?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-jetbrains-mono text-sm font-bold text-neutral-900 truncate max-w-[120px]">
                                                {testimonial.client}
                                            </h3>
                                            <p className="text-xs text-neutral-500 truncate max-w-[120px]">
                                                {testimonial.role ? `${testimonial.role} at ` : ''}{testimonial.company}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setModal({ open: true, mode: "edit", id: testimonial.id })}
                                            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <FiEdit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(testimonial.id)}
                                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <blockquote className="flex-1 mb-4">
                                    <p className="text-neutral-600 text-sm leading-relaxed line-clamp-4 italic">
                                        "{testimonial.content}"
                                    </p>
                                </blockquote>

                                {/* Footer: Metrics/Tags */}
                                <div className="pt-4 border-t border-neutral-100 mt-auto flex items-center justify-between">
                                    {testimonial.metric ? (
                                        <div className="flex flex-col">
                                            <span className="font-space-grotesk font-bold text-neutral-900 text-sm">{testimonial.metric}</span>
                                            <span className="font-jetbrains-mono text-[9px] uppercase tracking-wider text-neutral-500">{testimonial.metric_label}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-neutral-300 italic">No metric</span>
                                    )}

                                    <span className={`
                       px-2 py-0.5 text-[9px] font-jetbrains-mono uppercase tracking-wider border rounded-full
                       ${testimonial.featured ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-400 border-neutral-200'}
                   `}>
                                        {testimonial.featured ? 'Featured' : 'Standard'}
                                    </span>
                                </div>
                            </div>
                        </CornerFrame>
                    ))}
                </div>
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
