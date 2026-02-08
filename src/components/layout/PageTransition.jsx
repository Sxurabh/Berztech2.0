"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" }
  },
};

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    // Reverting to "wait" ensures the DOM is cleared before the new page enters
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // Ensure this key is definitely changing on click
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