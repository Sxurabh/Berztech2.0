"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { testimonialsApi } from "@/lib/api/client";
import TestimonialForm from "@/components/admin/TestimonialForm";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function NewTestimonialPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: testimonialsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries(["testimonials"]);
            toast.success("Testimonial created successfully");
            router.push("/admin/testimonials");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create testimonial");
        },
    });

    return (
        <div>
            <div className="mb-8">
                <Link
                    href="/admin/testimonials"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-4 text-xs font-jetbrains-mono uppercase tracking-wider"
                >
                    <FiArrowLeft className="w-3 h-3" />
                    Back to list
                </Link>
                <h1 className="font-space-grotesk text-2xl font-bold text-neutral-900">
                    New Testimonial
                </h1>
            </div>

            <TestimonialForm
                onSave={(data) => createMutation.mutate(data)}
                isSaving={createMutation.isPending}
            />
        </div>
    );
}
