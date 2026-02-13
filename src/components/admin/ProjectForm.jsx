"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiSave, FiArrowLeft, FiX, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import ImageUploader from "@/components/admin/ImageUploader";

const colorOptions = ["blue", "purple", "emerald", "amber", "rose", "cyan"];
const categoryOptions = ["Fintech", "Blockchain", "Mobile", "EdTech", "Sustainability", "Travel", "Healthcare", "SaaS", "AI/ML", "E-commerce"];

export default function ProjectForm({ mode = "create", embedded, onClose, onSuccess, editId }) {
    const router = useRouter();
    const params = useParams();
    const id = embedded ? editId : params?.id;
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(mode === "edit");
    const [newService, setNewService] = useState("");
    const [newStatKey, setNewStatKey] = useState("");
    const [newStatValue, setNewStatValue] = useState("");

    const [form, setForm] = useState({
        client: "",
        title: "",
        description: "",
        image: "/images/laptop.jpg",
        category: "Fintech",
        year: new Date().getFullYear().toString(),
        services: [],
        stats: {},
        color: "blue",
        featured: false,
    });

    useEffect(() => {
        if (mode === "edit" && id) {
            fetchProject();
        }
    }, [mode, id]);

    async function fetchProject() {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) throw new Error("Not found");
            const data = await res.json();
            setForm(data);
        } catch (err) {
            toast.error("Failed to load project");
            if (embedded && onClose) onClose();
            else router.push("/admin/projects");
        } finally {
            setLoading(false);
        }
    }

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const addService = () => {
        if (newService.trim()) {
            updateField("services", [...(form.services || []), newService.trim()]);
            setNewService("");
        }
    };

    const removeService = (index) => {
        updateField("services", form.services.filter((_, i) => i !== index));
    };

    const addStat = () => {
        if (newStatKey.trim() && newStatValue.trim()) {
            updateField("stats", { ...form.stats, [newStatKey.trim()]: newStatValue.trim() });
            setNewStatKey("");
            setNewStatValue("");
        }
    };

    const removeStat = (key) => {
        const next = { ...form.stats };
        delete next[key];
        updateField("stats", next);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.client || !form.title || !form.category) {
            toast.error("Please fill in all required fields");
            return;
        }

        setSaving(true);
        try {
            const url = mode === "edit" ? `/api/projects/${id}` : "/api/projects";
            const method = mode === "edit" ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Save failed");
            }

            toast.success(mode === "edit" ? "Project updated!" : "Project created!");
            if (embedded && onSuccess) onSuccess();
            else router.push("/admin/projects");
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
            {/* Header - hide in embedded modal */}
            {!embedded && (
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => router.push("/admin/projects")}
                        className="flex items-center gap-2 text-sm font-jetbrains-mono text-neutral-500 hover:text-white transition-colors mb-3"
                    >
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </button>
                    <h1 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-white tracking-tight">
                        {mode === "edit" ? "Edit Project" : "New Project"}
                    </h1>
                </div>
            </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Client & Title */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5 space-y-4">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-3">
                                Basic Info
                            </h3>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                    Client Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.client}
                                    onChange={(e) => updateField("client", e.target.value)}
                                    className="w-full px-4 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-space-grotesk text-sm"
                                    placeholder="Acme Inc."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                    Project Title *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    className="w-full px-4 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-space-grotesk text-sm"
                                    placeholder="Building the future of..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={form.description || ""}
                                    onChange={(e) => updateField("description", e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-space-grotesk text-sm resize-none"
                                    placeholder="Brief description of the project..."
                                />
                            </div>
                        </div>

                        {/* Image */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-3">
                                Cover Image
                            </h3>
                            <ImageUploader value={form.image} onChange={(url) => updateField("image", url)} />
                        </div>

                        {/* Services */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-3">
                                Services / Technologies
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {(form.services || []).map((service, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 bg-neutral-800/50 border border-neutral-700"
                                    >
                                        {service}
                                        <button type="button" onClick={() => removeService(i)} className="text-neutral-600 hover:text-red-400 ml-1">
                                            <FiX className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newService}
                                    onChange={(e) => setNewService(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                                    className="flex-1 px-3 py-2 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-xs"
                                    placeholder="Add service..."
                                />
                                <button
                                    type="button"
                                    onClick={addService}
                                    className="px-3 py-2 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                                >
                                    <FiPlus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-3">
                                Key Stats
                            </h3>
                            <div className="space-y-2 mb-3">
                                {Object.entries(form.stats || {}).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 p-2 bg-neutral-800/30 border border-neutral-700">
                                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500 w-24">{key}</span>
                                        <span className="text-sm text-white font-space-grotesk flex-1">{value}</span>
                                        <button type="button" onClick={() => removeStat(key)} className="text-neutral-600 hover:text-red-400">
                                            <FiX className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newStatKey}
                                    onChange={(e) => setNewStatKey(e.target.value)}
                                    className="w-28 px-3 py-2 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-xs"
                                    placeholder="Key"
                                />
                                <input
                                    type="text"
                                    value={newStatValue}
                                    onChange={(e) => setNewStatValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStat())}
                                    className="flex-1 px-3 py-2 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-xs"
                                    placeholder="Value"
                                />
                                <button
                                    type="button"
                                    onClick={addStat}
                                    className="px-3 py-2 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                                >
                                    <FiPlus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Publish Settings */}
                        <div className="bg-neutral-900/50 border border-neutral-800 p-5 space-y-4">
                            <h3 className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500 mb-1">
                                Settings
                            </h3>
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
                                    Year
                                </label>
                                <input
                                    type="text"
                                    value={form.year || ""}
                                    onChange={(e) => updateField("year", e.target.value)}
                                    className="w-full px-3 py-2.5 bg-neutral-800/30 border border-neutral-700 text-white focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-xs"
                                    placeholder="2024"
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

                        {/* Save Button */}
                        <motion.button
                            type="submit"
                            disabled={saving}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-neutral-900 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 transition-colors disabled:opacity-50"
                        >
                            <FiSave className="w-4 h-4" />
                            {saving ? "Saving..." : mode === "edit" ? "Update Project" : "Create Project"}
                        </motion.button>
                    </div>
                </div>
            </form>
        </div>
    );
}
