"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] w-full bg-white flex items-center">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: `linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)`, 
          backgroundSize: '60px 60px' 
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-24 sm:py-32">
        
        {/* Top Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <CornerFrame className="inline-block px-3 py-1.5 bg-neutral-50 border-neutral-200">
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
              Digital Engineering Studio
            </span>
          </CornerFrame>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl"
        >
          <span className="block font-space-grotesk text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-neutral-950 leading-[0.9]">
            We build systems
          </span>
          <span className="block font-space-grotesk text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-neutral-400 leading-[0.9] mt-2">
            that scale.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-12 max-w-xl relative"
        >
          <div className="absolute -left-6 top-0 bottom-0 w-px bg-neutral-200 hidden sm:block" />
          
          <p className="font-jetbrains-mono text-sm sm:text-base text-neutral-600 leading-relaxed">
            Boutique development agency specializing in unified codebases 
            for web, mobile, and desktop. No templates. Pure engineering.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 sm:mt-14 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/contact" className="group">
            <CornerFrame className="inline-block bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-900 transition-colors">
              <span className="flex items-center gap-3 px-6 py-3.5 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold">
                Start your project
                <span className="w-4 h-px bg-white/30 group-hover:w-6 transition-all" />
              </span>
            </CornerFrame>
          </Link>

          <Link href="/work" className="group inline-flex items-center gap-2 px-6 py-3.5 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-950 transition-colors">
            View work
            <span className="w-4 h-px bg-neutral-300 group-hover:w-6 group-hover:bg-neutral-950 transition-all" />
          </Link>
        </motion.div>

        {/* Bottom Stats Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 sm:mt-28 pt-8 border-t border-neutral-200"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: "50+", label: "Projects Delivered" },
              { value: "4.9", label: "Client Rating" },
              { value: "100%", label: "In-House Team" },
              { value: "12ms", label: "Avg. Response" },
            ].map((stat, i) => (
              <div key={stat.label} className="group cursor-default">
                <div className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-950 tabular-nums">
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Decorative Corner */}
      <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-neutral-200 hidden lg:block" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-neutral-200 hidden lg:block" />
    </section>
  );
}