// src/components/ui/PageHeader.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

/**
 * Reusable page header component with consistent eyebrow, title, and description pattern.
 * 
 * @param {string} eyebrow - Small uppercase label above the title
 * @param {string} title - Main heading text
 * @param {string} subtitle - Optional colored portion of title (displayed after line break)
 * @param {string} description - Optional paragraph below the title
 * @param {React.ReactNode} action - Optional action element (e.g., button) shown on right on desktop
 * @param {string} className - Additional classes for the wrapper
 */
export default function PageHeader({
    eyebrow,
    title,
    subtitle,
    description,
    action,
    className
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={clsx("", className)}
        >
            {/* Eyebrow */}
            {eyebrow && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-px w-4 bg-neutral-300" />
                    <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
                        {eyebrow}
                    </span>
                </div>
            )}

            {/* Title + Action row */}
            <div className={clsx(
                "flex flex-col gap-4",
                (description || action) && "sm:flex-row sm:items-end sm:justify-between"
            )}>
                <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-900 tracking-tight leading-[0.95]">
                    {title}
                    {subtitle && (
                        <>
                            <br />
                            <span className="text-neutral-500">{subtitle}</span>
                        </>
                    )}
                </h1>

                {/* Description or Action */}
                {(description || action) && (
                    <div className="flex flex-col gap-4 sm:items-end">
                        {description && (
                            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-sm">
                                {description}
                            </p>
                        )}
                        {action && (
                            <div className="shrink-0">{action}</div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
