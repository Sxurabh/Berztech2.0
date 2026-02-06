// src/components/RootLayout.jsx
"use client";

import { usePathname } from "next/navigation";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";

const RootLayoutInner = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
      <div className="relative min-h-screen bg-white">
        {/* Header with integrated expanding menu */}
        <Header />
        
        {/* Main content - gets pushed down naturally */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
        
        <Footer />
      </div>
    </MotionConfig>
  );
};

const RootLayout = ({ children }) => {
  const pathName = usePathname();
  return <RootLayoutInner key={pathName}>{children}</RootLayoutInner>;
};

export default RootLayout;