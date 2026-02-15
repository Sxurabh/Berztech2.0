"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { FiSave, FiX, FiCheck, FiUploadCloud, FiArrowLeft } from "react-icons/fi";
import { uploadApi, testimonialsApi } from "@/lib/api/client";
import { toast } from "react-hot-toast";

export default function TestimonialForm({ mode = "create", embedded, onClose, onSuccess, editId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        client: "",
        role: "",
        company: "",
        content: "",
        image: "",
        metric: "",
        metric_label: "",
        color: "blue",
        featured: false,
    });

    useEffect(() => {
        if (mode === "edit" && editId) {
            fetchTestimonial();
        }
    }, [mode, editId]);

    async function fetchTestimonial() {
        try {
            const data = await testimonialsApi.get(editId);
            setFormData({
                client: data.client || "",
                role: data.role || "",
                company: data.company || "",
                content: data.content || "",
                image: data.image || "",
                metric: data.metric || "",
                metric_label: data.metric_label || "",
                color: data.color || "blue",
                featured: data.featured || false,
            });
        } catch (err) {
            toast.error("Failed to load testimonial");
            if (embedded && onClose) onClose();
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("File must be an image");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be < 5MB");
            return;
        }

        setUploading(true);
        try {
            const { url } = await uploadApi.upload(file);
            setFormData(prev => ({ ...prev, image: url }));
            toast.success("Image uploaded!");
        } catch (error) {
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (mode === "edit") {
                await testimonialsApi.update(editId, formData);
                toast.success("Testimonial updated!");
            } else {
                await testimonialsApi.create(formData);
                toast.success("Testimonial created!");
            }

            if (embedded && onSuccess) {
                onSuccess();
            } else {
                router.push("/admin/testimonials");
            }
        } catch (error) {
            toast.error(error.message || "Failed to save testimonial");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <svg className="animate-spin h-8 w-8 text-neutral-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            </div>
        );
    }

    return (
        <div>
            {/* Header - hide in embedded modal */}
            {!embedded && (
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.push("/admin/testimonials")}
                            className="flex items-center gap-2 text-sm font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors mb-3"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Testimonials
                        </button>
                        <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight">
                            {mode === "edit" ? "Edit Testimonial" : "New Testimonial"}
                        </h1>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className={`grid gap-6 ${embedded ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>

                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <CornerFrame className="bg-white p-5 border-neutral-200">
                            <h3 className="font-space-grotesk font-semibold text-sm mb-4 text-neutral-900 border-b border-neutral-100 pb-2">
                                Client Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                        Client Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="client"
                                        required
                                        value={formData.client}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-space-grotesk"
                                        placeholder="e.g. Jane Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-space-grotesk"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-space-grotesk"
                                        placeholder="e.g. CTO"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                        Testimonial Content *
                                    </label>
                                    <textarea
                                        name="content"
                                        required
                                        rows={4}
                                        value={formData.content}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-space-grotesk resize-y"
                                        placeholder="The quote..."
                                    />
                                </div>
                            </div>
                        </CornerFrame>

                        <CornerFrame className="bg-white p-5 border-neutral-200">
                            <h3 className="font-space-grotesk font-semibold text-sm mb-4 text-neutral-900 border-b border-neutral-100 pb-2">
                                Metrics & Appearance
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                        Key Metric
                                    </label>
                                    <input
                                        type="text"
                                        name="metric"
                                        value={formData.metric}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-space-grotesk"
                                        placeholder="e.g. 200%"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                        Metric Label
                                    </label>
                                    <input
                                        type="text"
                                        name="metric_label"
                                        value={formData.metric_label}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-space-grotesk"
                                        placeholder="e.g. Growth"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                        Accent Color
                                    </label>
                                    <select
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-50 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors font-space-grotesk"
                                    >
                                        <option value="blue">Blue</option>
                                        <option value="emerald">Emerald</option>
                                        <option value="purple">Purple</option>
                                    </select>
                                </div>

                                <div className="flex items-center mt-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <div className={`
                        w-5 h-5 border flex items-center justify-center transition-colors
                        ${formData.featured ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-neutral-300'}
                    `}>
                                            {formData.featured && <FiCheck className="text-white w-3.5 h-3.5" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={formData.featured}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className="text-sm font-jetbrains-mono text-neutral-700">Featured Testimonial</span>
                                    </label>
                                </div>
                            </div>
                        </CornerFrame>
                    </div>

                    {/* Sidebar: Image */}
                    <div className="lg:col-span-1 space-y-6">
                        <CornerFrame className="bg-white p-5 border-neutral-200 sticky top-6">
                            <h3 className="font-space-grotesk font-semibold text-sm mb-4 text-neutral-900 border-b border-neutral-100 pb-2">
                                Author Image
                            </h3>

                            <div className="mb-4">
                                {formData.image ? (
                                    <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden border border-neutral-200 mb-2">
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                                            className="absolute top-2 right-2 p-1 bg-white/90 text-red-600 rounded-full hover:bg-white transition-colors"
                                        >
                                            <FiX className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="aspect-square w-full bg-neutral-50 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 mb-2">
                                        <FiUploadCloud className="w-8 h-8 mb-2" />
                                        <span className="text-xs text-center px-4">Upload Image</span>
                                    </div>
                                )}

                                <label className="block">
                                    <span className="sr-only">Choose profile photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="block w-full text-xs text-neutral-500
                       file:mr-4 file:py-2 file:px-4
                       file:border-0 file:text-xs file:font-semibold
                       file:bg-neutral-900 file:text-white
                       hover:file:bg-neutral-800
                       cursor-pointer
                     "
                                    />
                                </label>
                                {uploading && <p className="text-xs text-neutral-500 mt-2 animate-pulse">Uploading...</p>}
                            </div>

                            <div className="pt-6 border-t border-neutral-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving || uploading}
                                    className="w-full bg-neutral-900 text-white font-jetbrains-mono text-sm uppercase tracking-wider py-3 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {saving ? (
                                        <>Saving...</>
                                    ) : (
                                        <>
                                            <FiSave className="w-4 h-4" />
                                            Save Testimonial
                                        </>
                                    )}
                                </button>
                            </div>
                        </CornerFrame>
                    </div>
                </div>
            </form>
        </div>
    );
}
