// src/lib/design-tokens.js

export const serviceColors = {
    blue: {
        bg: "bg-blue-500",
        bgHover: "group-hover:bg-blue-50",
        bgLight: "bg-blue-50",
        text: "text-blue-600",
        textHover: "group-hover:text-blue-700",
        border: "border-blue-200",
        borderHover: "group-hover:border-blue-500/20",
        glow: "shadow-blue-500/20",
        glowHover: "group-hover:shadow-blue-500/10",
        line: "bg-blue-500",
        bracket: "!border-blue-400",
        fill: "fill-blue-500",
        stroke: "stroke-blue-500",
    },
    indigo: {
        bg: "bg-indigo-500",
        bgHover: "group-hover:bg-indigo-50",
        bgLight: "bg-indigo-50",
        text: "text-indigo-600",
        textHover: "group-hover:text-indigo-700",
        border: "border-indigo-200",
        borderHover: "group-hover:border-indigo-500/20",
        glow: "shadow-indigo-500/20",
        glowHover: "group-hover:shadow-indigo-500/10",
        line: "bg-indigo-500",
        bracket: "!border-indigo-400",
        fill: "fill-indigo-500",
        stroke: "stroke-indigo-500",
    },
    purple: {
        bg: "bg-purple-500",
        bgHover: "group-hover:bg-purple-50",
        bgLight: "bg-purple-50",
        text: "text-purple-600",
        textHover: "group-hover:text-purple-700",
        border: "border-purple-200",
        borderHover: "group-hover:border-purple-500/20",
        glow: "shadow-purple-500/20",
        glowHover: "group-hover:shadow-purple-500/10",
        line: "bg-purple-500",
        bracket: "!border-purple-400",
        fill: "fill-purple-500",
        stroke: "stroke-purple-500",
    },
    emerald: {
        bg: "bg-emerald-500",
        bgHover: "group-hover:bg-emerald-50",
        bgLight: "bg-emerald-50",
        text: "text-emerald-600",
        textHover: "group-hover:text-emerald-700",
        border: "border-emerald-200",
        borderHover: "group-hover:border-emerald-500/20",
        glow: "shadow-emerald-500/20",
        glowHover: "group-hover:shadow-emerald-500/10",
        line: "bg-emerald-500",
        bracket: "!border-emerald-400",
        fill: "fill-emerald-500",
        stroke: "stroke-emerald-500",
        // Special handling for Growth in Hero
        textDark: "text-emerald-950",
    },
    amber: {
        bg: "bg-amber-500",
        bgHover: "group-hover:bg-amber-50",
        bgLight: "bg-amber-50",
        text: "text-amber-600",
        textHover: "group-hover:text-amber-700",
        border: "border-amber-200",
        borderHover: "group-hover:border-amber-500/20",
        glow: "shadow-amber-500/20",
        glowHover: "group-hover:shadow-amber-500/10",
        line: "bg-amber-500",
        bracket: "!border-amber-400",
        fill: "fill-amber-500",
        stroke: "stroke-amber-500",
    },
    rose: {
        bg: "bg-rose-500",
        bgHover: "group-hover:bg-rose-50",
        bgLight: "bg-rose-50",
        text: "text-rose-600",
        textHover: "group-hover:text-rose-700",
        border: "border-rose-200",
        borderHover: "group-hover:border-rose-500/20",
        glow: "shadow-rose-500/20",
        glowHover: "group-hover:shadow-rose-500/10",
        line: "bg-rose-500",
        bracket: "!border-rose-400",
        fill: "fill-rose-500",
        stroke: "stroke-rose-500",
    },
    cyan: {
        bg: "bg-cyan-500",
        bgHover: "group-hover:bg-cyan-50",
        bgLight: "bg-cyan-50",
        text: "text-cyan-600",
        textHover: "group-hover:text-cyan-700",
        border: "border-cyan-200",
        borderHover: "group-hover:border-cyan-500/20",
        glow: "shadow-cyan-500/20",
        glowHover: "group-hover:shadow-cyan-500/10",
        line: "bg-cyan-500",
        bracket: "!border-cyan-400",
        fill: "fill-cyan-500",
        stroke: "stroke-cyan-500",
    }
};

export const typography = {
    fontFamily: {
        sans: "font-space-grotesk",
        mono: "font-jetbrains-mono",
    },
    fontSize: {
        tiny: "text-[9px]",
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
        "3xl": "text-3xl",
        "4xl": "text-4xl",
        "5xl": "text-5xl",
        "6xl": "text-6xl",
        "7xl": "text-7xl",
    },
    fontWeight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
    },
    tracking: {
        tight: "tracking-tight",
        wide: "tracking-wide",
        wider: "tracking-wider",
        widest: "tracking-widest",
    }
};

export const spacing = {
    container: {
        padding: "px-4 sm:px-6 lg:px-8",
        maxWidth: "max-w-5xl mx-auto",
        wrapper: "w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8",
    },
    section: {
        padding: "py-12 sm:py-16 lg:py-20",
        paddingSm: "py-6 sm:py-8 lg:py-12",
    },
    gap: {
        default: "gap-4 sm:gap-6 lg:gap-8",
        sm: "gap-2 sm:gap-4",
    }
};

export const animation = {
    transition: {
        default: "transition-all duration-300 ease-in-out",
        fast: "transition-all duration-150 ease-in-out",
        slow: "transition-all duration-500 ease-in-out",
    },
    hover: {
        scale: "hover:scale-105",
        lift: "hover:-translate-y-1",
    }
};
