"use client";
import React from "react";
import GridBackground from "@/components/GridBackground";

/**
 * GlobalGridWrapper - Adds consistent grid background to all main sections
 * Use this to wrap main content sections for consistent grid aesthetics
 */
export default function GlobalGridWrapper({ 
  children, 
  className = "",
  showGrid = true,
  gridOpacity = 0.05, // Increase default slightly
  gridSize = 40       // Match the default size used in other sections
}) {
  if (!showGrid) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      <GridBackground opacity={gridOpacity} size={gridSize} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

