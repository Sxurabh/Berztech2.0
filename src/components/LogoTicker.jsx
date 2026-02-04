"use client";
import React from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { wrap } from "framer-motion";

const logos = [
  { name: "Phobia", color: "#000" },
  { name: "Family Fund", color: "#000" },
  { name: "Unseal", color: "#000" },
  { name: "Mail Smirk", color: "#000" },
  { name: "Home Work", color: "#000" },
  { name: "Green Life", color: "#000" },
  { name: "Bright Path", color: "#000" },
  { name: "North Adventures", color: "#000" },
];

function LogoItem({ name, index }) {
  return (
    <motion.div
      className="flex items-center justify-center px-8 sm:px-12 lg:px-16"
      whileHover={{ scale: 1.1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity duration-500 cursor-default group">
        {/* Geometric Logo Mark */}
        <div className="relative w-8 h-8 sm:w-10 sm:h-10">
          <motion.div
            className="absolute inset-0 border-2 border-neutral-400 group-hover:border-neutral-600 transition-colors"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 border border-neutral-300 group-hover:border-neutral-500 transition-colors"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-jetbrains-mono text-xs font-bold text-neutral-500 group-hover:text-neutral-800 transition-colors">
              {name.charAt(0)}
            </span>
          </div>
        </div>
        
        <span className="font-space-grotesk text-sm sm:text-base font-medium text-neutral-400 group-hover:text-neutral-800 transition-colors whitespace-nowrap">
          {name}
        </span>
      </div>
    </motion.div>
  );
}

export default function LogoTicker() {
  const baseVelocity = -0.5;
  const baseX = useMotionValue(0);
  
  const x = useTransform(baseX, (v) => `${wrap(-100, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    const moveBy = baseVelocity * (delta / 1000) * 50;
    baseX.set(baseX.get() + moveBy);
  });

  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden bg-white border-y border-neutral-100">
      {/* Section Label */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="absolute top-4 left-6 lg:left-8"
      >
        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
          Trusted by industry leaders
        </span>
      </motion.div>

      {/* Gradient Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 lg:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 lg:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Ticker Track */}
      <div className="relative mt-6">
        <motion.div 
          className="flex"
          style={{ x }}
        >
          {duplicatedLogos.map((logo, index) => (
            <LogoItem key={`${logo.name}-${index}`} name={logo.name} index={index} />
          ))}
        </motion.div>
      </div>

      {/* Decorative Line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"
      />
    </section>
  );
}