// src/components/GridBackground.jsx
"use client";

export default function GridBackground({ opacity = 0.05, size = 40 }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <div 
        className="absolute inset-0"
        style={{ 
          // Use currentColor or a transparent black to work on white backgrounds
          backgroundImage: `linear-gradient(rgba(0,0,0,0.2) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px)`, 
          backgroundSize: `${size}px ${size}px` 
        }}
      />
    </div>
  );
}