// src/components/GridBackground.jsx
"use client";

export default function GridBackground({ opacity = 0.05, size = 40 }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <div 
        className="absolute inset-0"
        style={{ 
          // Changed to BLACK lines (#000) so they appear on your white background.
          // We rely on the container's 'opacity' prop (above) to make it faint.
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), 
                            linear-gradient(90deg, #000 1px, transparent 1px)`, 
          backgroundSize: `${size}px ${size}px` 
        }}
      />
    </div>
  );
}