// src/components/GlobalGridWrapper.jsx
"use client";
import React from "react";
import GridBackground from "@/components/GridBackground";

export default function GlobalGridWrapper({ 
  children, 
  className = "",
  showGrid = true,
  gridOpacity = 0.04, 
  gridSize = 32 // Syncing this with the Hero's internal grid size
}) {
  if (!showGrid) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* We wrap the background in a div that matches your Container's max-width 
         to ensure the vertical lines align with your content margins.
      */}
      <div className="absolute inset-0 overflow-hidden">
         <GridBackground opacity={gridOpacity} size={gridSize} />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}