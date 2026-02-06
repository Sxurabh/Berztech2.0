// src/components/RootLayout.jsx
"use client";

import { usePathname } from "next/navigation";
import { motion, MotionConfig, useReducedMotion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";

const RootLayoutInner = ({ children }) => {
  const shouldReduceMotion = useReducedMotion();
  const pathName = usePathname();

  return (
    <MotionConfig transition={shouldReduceMotion ? { duration: 0 } : undefined}>
      <div className="relative min-h-screen bg-white">
        <Header />
        
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