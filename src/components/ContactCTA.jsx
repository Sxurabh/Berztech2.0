"use client";
import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";

export default function ContactCTA() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left - rect.width / 2) / 20,
      y: (e.clientY - rect.top - rect.height / 2) / 20
    });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative py-32 sm:py-40 lg:py-52 bg-white overflow-hidden"
    >
      {/* Animated Background Elements */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 pointer-events-none"
      >
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`
          }}
        />
      </motion.div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `radial-gradient(circle, #171717 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }}
        />
      </div>

      <motion.div 
        style={{ opacity }}
        className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 text-center"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <CornerFrame className="inline-block px-4 py-2 bg-neutral-50">
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
              Start Your Project
            </span>
          </CornerFrame>
        </motion.div>

        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="font-space-grotesk text-4xl sm:text-5xl lg:text-7xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-8"
        >
          Let&apos;s build something
          <br />
          <span className="text-neutral-400">extraordinary together</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          Book a 30-minute discovery call. We&apos;ll discuss your challenges, 
          explore solutions, and outline a path forward—no commitment required.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          {/* Primary Button */}
          <Link href="/contact">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-3 bg-neutral-900 text-white px-8 py-4 font-jetbrains-mono text-sm uppercase tracking-widest overflow-hidden"
            >
              {/* Animated Background */}
              <motion.span
                className="absolute inset-0 bg-neutral-800"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              
              <span className="relative z-10">Schedule a Call</span>
              
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                →
              </motion.span>

              {/* Corner Accents */}
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
              <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />
              <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30" />
            </motion.span>
          </Link>

          {/* Secondary Button */}
          <Link href="/work">
            <span className="group inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-jetbrains-mono text-sm uppercase tracking-widest transition-colors">
              View Our Work
              <span className="w-6 h-px bg-neutral-400 group-hover:w-8 group-hover:bg-neutral-900 transition-all" />
            </span>
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 text-xs font-jetbrains-mono text-neutral-400 uppercase tracking-wider"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Available Q1 2024</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-neutral-200" />
          <div>Response within 24h</div>
          <div className="hidden sm:block w-px h-4 bg-neutral-200" />
          <div>Free Discovery Call</div>
        </motion.div>

        {/* Large Decorative Text */}
        
      </motion.div>

      {/* Connecting Line to Footer */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-neutral-200 to-transparent" />
    </section>
  );
}