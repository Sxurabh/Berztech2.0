// src/components/Hero.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";
import { layoutConfig } from "@/config/layout";
import clsx from "clsx";
import TrustBar from "./TrustBar";


// Simplified animated counter for mobile performance
function AnimatedCounter({ value, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isVisible) {
        setIsVisible(true);
      }
    }, { threshold: 0.5, rootMargin: "0px" });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isVisible, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

// Magnetic button with reduced motion for mobile
function MagneticButton({ children, href, variant = "primary", className }) {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.1;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.1;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0, 0)";
  };

  const variants = {
    primary: "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800",
    secondary: "bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
  };

  return (
    <Link 
      href={href} 
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={ref}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <CornerFrame 
          className={clsx("inline-block transition-all duration-300", variants[variant])}
          bracketClassName="w-2.5 h-2.5 sm:w-3 sm:h-3 border-current opacity-30 group-hover:opacity-100 transition-opacity"
        >
          <span className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 font-jetbrains-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
            {children}
          </span>
        </CornerFrame>
      </motion.div>
    </Link>
  );
}

// Optimized background for mobile
// src/components/Hero.jsx

function OptimizedBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(0,0,0,0.05), transparent 40%)`;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* FIX: Increased opacity to 0.05 and added 'backgroundPosition: center top'.
         This ensures the grid lines align with your centered max-w-5xl container.
      */}
      
      
      {!isMobile && (
        <motion.div 
          className="pointer-events-none absolute inset-0"
          style={{ background }}
        />
      )}
      
      <div className="absolute top-1/4 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />
    </div>
  );
}

// Text reveal animation
function TextReveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className={clsx("overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
}

// Status badge component
function StatusBadge() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="inline-flex mb-4 sm:mb-6"
    >
      <CornerFrame className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white border-neutral-200 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-emerald-500" />
          </span>
          <span className="text-[9px] sm:text-[10px] font-jetbrains-mono font-medium uppercase tracking-wider text-neutral-600">
            Available for Q1 Projects
          </span>
        </div>
      </CornerFrame>
    </motion.div>
  );
}

export default function Hero() {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section 
      ref={containerRef}
      // REMOVED "bg-white" from the class list below
      className="relative w-full overflow-hidden" 
      style={{ 
        minHeight: "auto" 
      }}
    >
        

      <OptimizedBackground />

      <motion.div 
        style={{ y: springY, opacity: springOpacity }}
        className="relative z-10 w-full flex flex-col"
      >
        {/* ✅ KEY CHANGE: Reduced padding, no excessive top spacing */}
        <div className={clsx(
          "flex flex-col justify-center",
          // Mobile: compact padding, natural height
          "py-6 sm:py-8 lg:py-12",
          // ✅ KEY CHANGE: Consistent max-width with rest of site
          "mx-auto max-w-5xl",
          "w-full",
          // Padding consistent with other sections
          "px-4 sm:px-6 lg:px-8"
        )}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 xl:col-span-6 order-2 lg:order-1">
              <StatusBadge />

              {/* Headline - tighter spacing */}
              <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                <TextReveal delay={0.1}>
                  <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-neutral-950 leading-[0.95]">
                    Engineering
                  </h1>
                </TextReveal>
                <TextReveal delay={0.2}>
                  <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight leading-[0.95] text-neutral-400">
                    Digital
                  </h1>
                </TextReveal>
                <TextReveal delay={0.3}>
                  <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-neutral-950 leading-[0.95] relative inline-block">
                    Excellence
                    <motion.span 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-2 sm:h-3 bg-emerald-100 origin-left -z-10"
                    />
                  </h1>
                </TextReveal>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-sm sm:text-base lg:text-lg text-neutral-600 leading-relaxed max-w-lg mb-6 sm:mb-8"
              >
                We are a boutique engineering studio architecting high-performance 
                web applications for the next generation of digital leaders. 
                No templates, just pure code.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <MagneticButton href="/contact" variant="primary" className="group w-full sm:w-auto justify-center">
                  <span>Start your project</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.span>
                </MagneticButton>
                
                <MagneticButton href="/process" variant="secondary" className="group w-full sm:w-auto justify-center">
                  Explore our process
                </MagneticButton>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-neutral-100 grid grid-cols-3 gap-4 sm:gap-6 max-w-md"
              >
                {[
                  { value: 50, suffix: "+", label: "Projects" },
                  { value: 98, suffix: "%", label: "Retention" },
                  { value: 7, suffix: "+", label: "Years" }
                ].map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="font-space-grotesk text-lg sm:text-xl font-medium text-neutral-900">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500 mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Visual - Desktop only */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 order-1 lg:order-2 items-center justify-center">
              {/* ... keep existing code visualization */}
            </div>
          </div>
        </div>

        {/* TrustBar - Always at bottom */}
        <div className="w-full mt-4 sm:mt-6">
          <TrustBar />
        </div>
      </motion.div>
    </section>
  );
}