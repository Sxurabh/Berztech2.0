"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

export default function GridBackground({ opacity = 0.05, size = 32 }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    let rafId = null;
    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);

  // Create a mask that is fully transparent normally, but opaque in a circle around the cursor
  const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black, transparent 100%)`;

  const gridStyle = {
    backgroundImage: `linear-gradient(#000 1px, transparent 1px), 
                      linear-gradient(90deg, #000 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
    backgroundPosition: 'center top'
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Base dim grid (always visible) */}
      <div
        className="absolute inset-0"
        style={{ ...gridStyle, opacity: opacity }}
      />

      {/* Highlighted grid (only visible near cursor on non-touch devices) */}
      {isClient && (
        <motion.div
          className="absolute inset-0 hidden sm:block"
          style={{
            ...gridStyle,
            opacity: Math.min(opacity * 2, 0.4), // Higher opacity for the highlight, capped at 0.4
            WebkitMaskImage: maskImage,
            maskImage: maskImage
          }}
        />
      )}
    </div>
  );
}