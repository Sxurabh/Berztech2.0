"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.98,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
  },
};

const RootLayoutInner = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={shouldReduceMotion ? {} : pageVariants}
        className="relative min-h-screen bg-white"
      >
        <Header />
        <motion.main 
          id="main-content"
          aria-label="Page content"
          variants={shouldReduceMotion ? {} : { animate: { opacity: 1, y: 0 } }}
          className="focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </motion.main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
};

export default function RootLayout({ children }) {
  const pathName = usePathname();
  return <RootLayoutInner key={pathName}>{children}</RootLayoutInner>;
}