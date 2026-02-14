"use client";

import { useState, useRef } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";
import Image from "next/image";

export default function ImageUploader({ value, onChange, className = "" }) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    const handleUpload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            return;
        }

        setError("");
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            onChange(data.url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        handleUpload(file);
    };

    return (
        <div className={className}>
            {value ? (
                // Preview
                <div className="relative group">
                    <div className="relative aspect-video bg-neutral-800 border border-neutral-700 overflow-hidden">
                        <Image
                            src={value}
                            alt="Upload preview"
                            fill
                            className="object-cover"
                            sizes="400px"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-2 right-2 p-1.5 bg-neutral-900/80 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <FiX className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute bottom-2 right-2 px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-widest bg-neutral-900/80 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        Replace
                    </button>
                </div>
            ) : (
                // Dropzone
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`
            relative aspect-video flex flex-col items-center justify-center cursor-pointer
            border-2 border-dashed transition-all duration-200
            ${dragActive
                            ? "border-white bg-white/5"
                            : "border-neutral-700 bg-neutral-800/30 hover:border-neutral-600 hover:bg-neutral-800/50"
                        }
            ${uploading ? "pointer-events-none opacity-50" : ""}
          `}
                >
                    {uploading ? (
                        <>
                            <svg className="animate-spin h-8 w-8 text-neutral-400 mb-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-xs font-jetbrains-mono text-neutral-500">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <FiUpload className="w-8 h-8 text-neutral-500 mb-3" />
                            <span className="text-xs font-jetbrains-mono text-neutral-500 mb-1">
                                Drop image here or click to browse
                            </span>
                            <span className="text-[10px] font-jetbrains-mono text-neutral-600">
                                PNG, JPG, WebP • Max 5MB
                            </span>
                        </>
                    )}
                </div>
            )}

            {/* Manual URL input */}
            <div className="mt-2 flex items-center gap-2">
                <FiImage className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="flex-1 px-3 py-1.5 bg-neutral-800/30 border border-neutral-700 text-white placeholder-neutral-600 focus:border-neutral-500 focus:outline-none font-jetbrains-mono text-xs"
                />
            </div>

            {error && (
                <p className="mt-1 text-xs font-jetbrains-mono text-red-400">{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files[0])}
                className="hidden"
            />
        </div>
    );
}
