// src/components/GridBackground.jsx
"use client";

export default function GridBackground({ opacity = 0.015, size = 40 }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)`, 
          backgroundSize: `${size}px ${size}px` 
        }}
      />
    </div>
  );
}