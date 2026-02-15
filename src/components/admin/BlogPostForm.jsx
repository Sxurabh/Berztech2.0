"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiSave, FiArrowLeft, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";
import { CornerFrame } from "../ui/CornerFrame";

const colorOptions = ["blue", "purple", "emerald", "amber", "rose", "cyan"];
const categoryOptions = ["Engineering", "Design", "Strategy", "Culture", "Product", "Tutorial"];

export default function BlogPostForm({ mode = "create", embedded, onClose, onSuccess, editId }) {
    const router = useRouter();
    const params = useParams();
    const id = embedded ? editId : params?.id;
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");

    const [form, setForm] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "Engineering",
        author: "",
        read_time: "",
        image: "/images/laptop.jpg",
        featured: false,
        color: "blue",
        published: false,
    });

    useEffect(() => {
        if (mode === "edit" && id) {
            fetchPost();
        }
    }, [mode, id]);

    async function fetchPost() {
        try {
            const res = await fetch(`/api/blog/${id}`);
            if (!res.ok) throw new Error("Not found");
            const data = await res.json();
            setForm(data);
        } catch (err) {
            toast.error("Failed to load post");
            if (embedded && onClose) onClose();
            else router.push("/admin/blog");
        } finally {
            setLoading(false);
        }
    }

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    // Calculate read time from content
    const calcReadTime = (text) => {
        const words = (text || "").split(/\s+/).filter(Boolean).length;
        const mins = Math.max(1, Math.round(words / 200));
        return `${mins} min read`;
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.title || !form.category || !form.author) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Auto-calculate read time if not set
        const submitData = {
            ...form,
            read_time: form.read_time || calcReadTime(form.content),
        };

        setSaving(true);
        try {
            const url = mode === "edit" ? `/api/blog/${id}` : "/api/blog";
            const method = mode === "edit" ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Save failed");
            }

            toast.success(mode === "edit" ? "Post updated!" : "Post created!");
            if (embedded && onSuccess) onSuccess();
            else router.push("/admin/blog");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    }

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

    // Simplified styles for white theme
    const inputClass = "w-full bg-neutral-50 border border-neutral-200 p-2.5 text-sm focus:outline-none focus:border-neutral-900 transition-colors placeholder:text-neutral-400 font-space-grotesk";
    const labelClass = "block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2";

    return (
        <div>
            {/* Header - hide in embedded modal */}
            {!embedded && (
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.push("/admin/blog")}
                            className="flex items-center gap-2 text-sm font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors mb-3"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Blog Posts
                        </button>
                        <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight">
                            {mode === "edit" ? "Edit Blog Post" : "New Blog Post"}
                        </h1>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className={`grid gap-6 ${embedded ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"}`}>
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Excerpt */}
                        <CornerFrame className="bg-white p-5 border-neutral-200">
                            <h3 className="font-space-grotesk font-semibold text-sm mb-4 text-neutral-900 border-b border-neutral-100 pb-2">
                                Post Info
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => updateField("title", e.target.value)}
                                        className={inputClass}
                                        placeholder="Your blog post title..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Excerpt
                                    </label>
                                    <textarea
                                        value={form.excerpt || ""}
                                        onChange={(e) => updateField("excerpt", e.target.value)}
                                        rows={3}
                                        className={`${inputClass} resize-none`}
                                        placeholder="A brief summary of the post..."
                                    />
                                </div>
                            </div>
                        </CornerFrame>

                        {/* Content Editor */}
                        <CornerFrame className="bg-white p-5 border-neutral-200">
                            <h3 className="font-space-grotesk font-semibold text-sm mb-4 text-neutral-900 border-b border-neutral-100 pb-2">
                                Content (Markdown)
                            </h3>
                            <textarea
                                value={form.content || ""}
                                onChange={(e) => updateField("content", e.target.value)}
                                rows={20}
                                className={`${inputClass} font-jetbrains-mono resize-y leading-relaxed`}
                                placeholder="# My Blog Post&#10;&#10;Write your content in markdown..."
                            />
                            <p className="mt-2 text-[10px] font-jetbrains-mono text-neutral-500">
                                Supports Markdown formatting • {calcReadTime(form.content)}
                            </p>
                        </CornerFrame>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish Settings */}
                        <CornerFrame className="bg-white p-5 border-neutral-200">
                            <h3 className="font-space-grotesk font-semibold text-sm mb-4 text-neutral-900 border-b border-neutral-100 pb-2">
                                Publish Settings
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-sm border border-neutral-100">
                                    <label className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
                                        Published
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => updateField("published", !form.published)}
                                        className={`
                                            w-9 h-5 rounded-full relative transition-colors duration-200
                                            ${form.published ? "bg-neutral-900" : "bg-neutral-300"}
                                        `}
                                    >
                                        <span
                                            className={`
                                                absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm
                                                ${form.published ? "left-4.5" : "left-0.5"}
                                            `}
                                            style={{ left: form.published ? "calc(100% - 18px)" : "2px" }}
                                        />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-sm border border-neutral-100">
                                    <label className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
                                        Featured
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => updateField("featured", !form.featured)}
                                        className={`
                                            w-9 h-5 rounded-full relative transition-colors duration-200
                                            ${form.featured ? "bg-neutral-900" : "bg-neutral-300"}
                                        `}
                                    >
                                        <span
                                            className={`
                                                absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm
                                                ${form.featured ? "left-4.5" : "left-0.5"}
                                            `}
                                            style={{ left: form.featured ? "calc(100% - 18px)" : "2px" }}
                                        />
                                    </button>
                                </div>
                            </div>
                        </CornerFrame>

                        {/* Meta */}
                        <CornerFrame className="bg-white p-5 border-neutral-200">
                            <h3 className="font-space-grotesk font-semibold text-sm mb-4 text-neutral-900 border-b border-neutral-100 pb-2">
                                Meta Info
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>
                                        Author *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.author}
                                        onChange={(e) => updateField("author", e.target.value)}
                                        className={inputClass}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Category *
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => updateField("category", e.target.value)}
                                        className={inputClass}
                                    >
                                        {categoryOptions.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Read Time
                                    </label>
                                    <input
                                        type="text"
                                        value={form.read_time || ""}
                                        onChange={(e) => updateField("read_time", e.target.value)}
                                        className={inputClass}
                                        placeholder="Auto-calculated"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Color Theme
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => updateField("color", color)}
                                                className={`
                                                    px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-wider border transition-all
                                                    ${form.color === color
                                                        ? "bg-neutral-900 text-white border-neutral-900"
                                                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"}
                                                `}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CornerFrame>

                        {/* Cover Image */}
                        <CornerFrame className="bg-white p-5 border-neutral-200">
                            <h3 className="font-space-grotesk font-semibold text-sm mb-4 text-neutral-900 border-b border-neutral-100 pb-2">
                                Cover Image
                            </h3>
                            <ImageUploader value={form.image} onChange={(url) => updateField("image", url)} />
                        </CornerFrame>

                        {/* Save */}
                        <motion.button
                            type="submit"
                            disabled={saving}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white hover:bg-neutral-800 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
                        >
                            <FiSave className="w-4 h-4" />
                            {saving ? "Saving..." : mode === "edit" ? "Update Post" : "Create Post"}
                        </motion.button>
                    </div>
                </div>
            </form>
        </div>
    );
}
