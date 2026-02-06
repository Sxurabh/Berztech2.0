// src/config/layout.js
export const layoutConfig = {
  // Main container max width - consistent across all components
  maxWidth: "max-w-5xl",
  
  // Standard padding
  padding: {
    mobile: "px-4",
    tablet: "sm:px-6",
    desktop: "lg:px-8",
  },
  
  // Section spacing
  spacing: {
    section: "py-12 sm:py-16 lg:py-20",
    tight: "py-8 sm:py-10",
    hero: "min-h-screen pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-0 lg:pb-0",
  },
  
  // Grid system - 12 columns like ProcessStrip
  grid: {
    container: "grid grid-cols-12 gap-4 sm:gap-6 lg:gap-8",
    // Common column spans
    full: "col-span-12",
    half: "col-span-12 lg:col-span-6",
    third: "col-span-12 sm:col-span-6 lg:col-span-4",
    twoThirds: "col-span-12 lg:col-span-8",
    quarter: "col-span-6 sm:col-span-3",
    // Sidebar layouts
    content: "col-span-12 lg:col-span-8",
    sidebar: "col-span-12 lg:col-span-4",
    // Main/Sidebar reversed
    mainWide: "col-span-12 lg:col-span-7",
    sideNarrow: "col-span-12 lg:col-span-5",
  },
  
  // Typography scale
  typography: {
    eyebrow: "text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400",
    h2: "font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-tight leading-tight",
    body: "text-sm sm:text-base text-neutral-600 leading-relaxed",
    small: "text-xs text-neutral-500",
  },
  
  // Component-specific
  card: {
    base: "bg-white border-neutral-200",
    hover: "hover:border-neutral-300 transition-colors",
    padding: "p-4 sm:p-5 lg:p-6",
  },
  
  // Frame brackets
  bracket: {
    sm: "w-3 h-3 border-neutral-300",
    md: "w-4 h-4 border-neutral-300",
    lg: "w-5 h-5 border-neutral-300",
  },
};