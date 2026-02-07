// src/components/GridBackground.jsx
"use client";

export default function GridBackground({ opacity = 0.05, size = 32 }) {
  return (
    <div className="absolute inset-0 pointer-events-none select-none" style={{ opacity }}>
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), 
                            linear-gradient(90deg, #000 1px, transparent 1px)`, 
          backgroundSize: `${size}px ${size}px`,
          // This matches the Hero background position
          backgroundPosition: 'center top' 
        }}
      />
    </div>
  );
}