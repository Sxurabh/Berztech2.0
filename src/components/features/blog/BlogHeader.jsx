"use client";
import { motion } from "framer-motion";

export default function BlogHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-px w-4 bg-neutral-300" />
        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
          Blog
        </span>
        <div className="h-px w-4 bg-neutral-300" />
      </div>
      
      <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-4">
        The latest articles<br />
        <span className="text-neutral-500">and insights</span>
      </h1>
      <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
        Thoughts on engineering, design, and building digital products that matter. 
        No fluff, just lessons from the trenches.
      </p>
    </motion.div>
  );
}
