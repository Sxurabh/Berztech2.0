// src/components/GridBackground.jsx
"use client";

export default function GridBackground({ opacity = 0.1, size = 40 }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <div 
        className="absolute inset-0"
        style={{ 
          // Changed to white lines (rgba 255, 255, 255) for visibility on dark backgrounds
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, 
          backgroundSize: `${size}px ${size}px` 
        }}
      />
    </div>
  );
}