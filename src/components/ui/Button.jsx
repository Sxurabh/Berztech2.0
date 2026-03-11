// src/components/ui/Button.jsx
"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import { CornerFrame } from "./CornerFrame";

/**
 * Unified button component with corner-bracket styling.
 * 
 * @param {React.ReactNode} children - Button content
 * @param {string} href - Optional link destination (renders as Link if provided)
 * @param {"primary" | "secondary"} variant - Button style variant
 * @param {boolean} showArrow - Whether to show animated arrow
 * @param {boolean} disabled - Disabled state
 * @param {"button" | "submit" | "reset"} type - Button type for form buttons
 * @param {Function} onClick - Click handler
 * @param {string} className - Additional classes
 * @param {boolean} fullWidth - Whether button takes full width on mobile
 */
export default function Button({
    children,
    href,
    variant = "primary",
    showArrow = false,
    disabled = false,
    loading = false,
    type = "button",
    onClick,
    className,
    fullWidth = false,
    ...props
}) {
    const variants = {
        primary: "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800",
        secondary: "bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50",
        danger: "bg-red-600 text-white border-red-600 hover:bg-red-700"
    };

    const bracketColors = {
        primary: "border-white/30 group-hover:border-white/60",
        secondary: "border-neutral-300 group-hover:border-neutral-500",
        danger: "border-white/30 group-hover:border-white/60"
    };

    const content = (
        <CornerFrame
            className={clsx(
                "inline-block transition-all duration-300",
                variants[variant],
                (disabled || loading) && "opacity-70 cursor-not-allowed"
            )}
            bracketClassName={clsx(
                "w-2.5 h-2.5 sm:w-3 sm:h-3 transition-colors",
                bracketColors[variant]
            )}
        >
            <span className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 font-jetbrains-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold flex-row">
                {loading && (
                    <svg
                        data-testid="loading-spinner"
                        className="animate-spin -ml-1 h-3 w-3 sm:h-4 sm:w-4 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {children}
                {showArrow && (
                    <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        →
                    </motion.span>
                )}
            </span>
        </CornerFrame>
    );

    const wrapperClasses = clsx(
        "group inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-sm",
        fullWidth && "w-full sm:w-auto",
        className
    );

    if (href && !disabled) {
        return (
            <Link href={href} className={wrapperClasses} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={wrapperClasses}
            {...props}
        >
            {content}
        </button>
    );
}
