"use client";
import { motion } from "framer-motion";

export default function ContactHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px w-4 bg-neutral-300" />
        <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
          Contact us
        </span>
      </div>
      
      <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-4">
        Let&apos;s work<br />
        <span className="text-neutral-500">together</span>
      </h1>
      <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed">
        We cannot wait to hear from you. Tell us about your project and let&apos;s build something extraordinary.
      </p>
    </motion.div>
  );
}
