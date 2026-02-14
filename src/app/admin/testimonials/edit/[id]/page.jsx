"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { testimonialsApi } from "@/lib/api/client";
import TestimonialForm from "@/components/admin/TestimonialForm";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { useParams } from "next/navigation";

export default function EditTestimonialPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;
    const queryClient = useQueryClient();

    // Fetch Logic
    const { data: testimonial, isLoading, isError } = useQuery({
        queryKey: ["testimonial", id],
        queryFn: () => testimonialsApi.get(id),
        enabled: !!id,
    });

    const updateMutation = useMutation({
        mutationFn: (data) => testimonialsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["testimonials"]);
            queryClient.invalidateQueries(["testimonial", id]);
            toast.success("Testimonial updated successfully");
            router.push("/admin/testimonials");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update testimonial");
        },
    });

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

    if (isError || !testimonial) {
        return (
            <div className="text-center py-20">
                <h3 className="text-neutral-900 font-bold mb-2">Testimonial not found</h3>
                <Link href="/admin/testimonials" className="text-sm underline">Back to list</Link>
            </div>
        );
    }

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
                    Edit Testimonial
                </h1>
            </div>

            <TestimonialForm
                initialData={testimonial}
                onSave={(data) => updateMutation.mutate(data)}
                isSaving={updateMutation.isPending}
            />
        </div>
    );
}
