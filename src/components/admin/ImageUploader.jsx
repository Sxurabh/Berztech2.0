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
                    <div className="relative h-48 bg-neutral-50 border border-neutral-200 overflow-hidden rounded-sm">
                        <Image
                            src={value}
                            alt="Upload preview"
                            fill
                            className="object-contain p-2"
                            sizes="400px"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-2 right-2 p-1.5 bg-white border border-neutral-200 text-neutral-400 hover:text-red-500 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100 shadow-sm rounded-sm"
                    >
                        <FiX className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute bottom-2 right-2 px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-widest bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 transition-colors opacity-0 group-hover:opacity-100 shadow-sm rounded-sm"
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
            relative h-32 flex flex-col items-center justify-center cursor-pointer
            border border-dashed transition-all duration-200 rounded-sm
            ${dragActive
                            ? "border-neutral-400 bg-neutral-50"
                            : "border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50"
                        }
            ${uploading ? "pointer-events-none opacity-50" : ""}
          `}
                >
                    {uploading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-neutral-400 mb-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-[10px] font-jetbrains-mono text-neutral-500">Uploading...</span>
                        </>
                    ) : (
                        <div className="flex flex-col items-center text-center p-4">
                            <FiUpload className="w-5 h-5 text-neutral-400 mb-2" />
                            <span className="text-[10px] font-jetbrains-mono text-neutral-500">
                                Click to upload or drag image
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Manual URL input */}
            <div className="mt-2 flex items-center gap-2">
                <FiImage className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Or paste image URL..."
                    className="flex-1 px-2 py-1.5 bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none font-jetbrains-mono text-[10px] rounded-sm"
                />
            </div>

            {error && (
                <p className="mt-1 text-[10px] font-jetbrains-mono text-red-500">{error}</p>
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
