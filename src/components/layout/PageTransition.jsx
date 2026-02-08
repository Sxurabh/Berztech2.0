"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" } // Reduced from 0.5
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.98,
    transition: { duration: 0.2, ease: "easeIn" } // Reduced from 0.3
  },
};

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    // CHANGE 1: Remove mode="wait" to allow overlap, or use "popLayout"
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={shouldReduceMotion ? {} : pageVariants}
        className="flex-grow w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}