// src/components/GlobalGridWrapper.jsx
"use client";
import React from "react";
import GridBackground from "@/components/GridBackground";

export default function GlobalGridWrapper({ 
  children, 
  className = "",
  showGrid = true,
  gridOpacity = 0.05, // 0.05 (5%) is good for subtle texture. Try 0.1 if barely visible.
  gridSize = 40
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