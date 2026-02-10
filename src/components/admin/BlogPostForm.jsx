"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiSave, FiArrowLeft, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";

const colorOptions = ["blue", "purple", "emerald", "amber", "rose", "cyan"];
const categoryOptions = ["Engineering", "Design", "Strategy", "Culture", "Product", "Tutorial"];

export default function BlogPostForm({ mode = "create" }) {
    const router = useRouter();
    const params = useParams();
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
        if (mode === "edit" && params?.id) {
            fetchPost();
        }
    }, [mode, params?.id]);

    async function fetchPost() {
        try {
            const res = await fetch(`/api/blog/${params.id}`);
            if (!res.ok) throw new Error("Not found");
            const data = await res.json();
            setForm(data);
        } catch (err) {
            toast.error("Failed to load post");
            router.push("/admin/blog");
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
            const url = mode === "edit" ? `/api/blog/${params.id}` : "/api/blog";
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
            router.push("/admin/blog");
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

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => router.push("/admin/blog")}
                        className="flex items-center gap-2 text-sm font-jetbrains-mono text-neutral-500 hover:text-white transition-colors mb-3"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Blog Posts
                    </button>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-white tracking-tight">
                        {mode === "edit" ? "Edit Blog Post" : "New Blog Post"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Excerpt */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5 space-y-4">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-3">
                                Post Info
                            </h3>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    className="w-full px-4 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-space-grotesk text-sm"
                                    placeholder="Your blog post title..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                    Excerpt
                                </label>
                                <textarea
                                    value={form.excerpt || ""}
                                    onChange={(e) => updateField("excerpt", e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-space-grotesk text-sm resize-none"
                                    placeholder="A brief summary of the post..."
                                />
                            </div>
                        </div>

                        {/* Content Editor */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-3">
                                Content (Markdown)
                            </h3>
                            <textarea
                                value={form.content || ""}
                                onChange={(e) => updateField("content", e.target.value)}
                                rows={20}
                                className="w-full px-4 py-3 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-sm resize-y leading-relaxed"
                                placeholder="# My Blog Post&#10;&#10;Write your content in markdown..."
                            />
                            <p className="mt-2 text-[10px] font-jetbrains-mono text-neutral-600">
                                Supports Markdown formatting • {calcReadTime(form.content)}
                            </p>
                        </div>

                        {/* Cover Image */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-3">
                                Cover Image
                            </h3>
                            <ImageUploader value={form.image} onChange={(url) => updateField("image", url)} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish Settings */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5 space-y-4">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-1">
                                Publish Settings
                            </h3>
                            <div className="flex items-center justify-between py-2">
                                <label className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                    Published
                                </label>
                                <button
                                    type="button"
                                    onClick={() => updateField("published", !form.published)}
                                    className={`
                    w-10 h-5 rounded-full relative transition-colors duration-200
                    ${form.published ? "bg-emerald-500" : "bg-neutral-700"}
                  `}
                                >
                                    <span
                                        className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200
                      ${form.published ? "left-5" : "left-0.5"}
                    `}
                                    />
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <label className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                                    Featured
                                </label>
                                <button
                                    type="button"
                                    onClick={() => updateField("featured", !form.featured)}
                                    className={`
                    w-10 h-5 rounded-full relative transition-colors duration-200
                    ${form.featured ? "bg-blue-500" : "bg-neutral-700"}
                  `}
                                >
                                    <span
                                        className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200
                      ${form.featured ? "left-5" : "left-0.5"}
                    `}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5 space-y-4">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-1">
                                Meta
                            </h3>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                    Author *
                                </label>
                                <input
                                    type="text"
                                    value={form.author}
                                    onChange={(e) => updateField("author", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-xs"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                    Category *
                                </label>
                                <select
                                    value={form.category}
                                    onChange={(e) => updateField("category", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-xs"
                                >
                                    {categoryOptions.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                    Read Time
                                </label>
                                <input
                                    type="text"
                                    value={form.read_time || ""}
                                    onChange={(e) => updateField("read_time", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-xs"
                                    placeholder="Auto-calculated"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
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
                                                    ? "bg-white/10 border-white text-white"
                                                    : "border-neutral-700 text-neutral-500 hover:border-neutral-600"
                                                }
                      `}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Save */}
                        <motion.button
                            type="submit"
                            disabled={saving}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-neutral-900 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-50"
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
