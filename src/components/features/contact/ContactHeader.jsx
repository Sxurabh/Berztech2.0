"use client";
import { motion } from "framer-motion";
import { typography } from "@/lib/design-tokens";

export default function ContactHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex items-center gap-2 mb-3 justify-center">
        <div className="h-px w-4 bg-neutral-300" />
        <span className={`${typography.fontSize.xs} ${typography.fontFamily.mono} uppercase ${typography.tracking.widest} text-neutral-600`}>
          Contact us
        </span>
        <div className="h-px w-4 bg-neutral-300" />
      </div>

      <h1 className={`${typography.fontFamily.sans} ${typography.fontSize["3xl"]} sm:${typography.fontSize["4xl"]} md:${typography.fontSize["5xl"]} lg:${typography.fontSize["6xl"]} ${typography.fontWeight.medium} text-neutral-900 ${typography.tracking.tight} leading-[0.95] mb-4`}>
        Let&apos;s work<br />
        <span className="text-neutral-500">together</span>
      </h1>
      <p className={`${typography.fontSize.base} sm:${typography.fontSize.lg} text-neutral-600 max-w-xl leading-relaxed mx-auto`}>
        We cannot wait to hear from you. Tell us about your project and let&apos;s build something extraordinary.
      </p>
    </motion.div>
  );
}
