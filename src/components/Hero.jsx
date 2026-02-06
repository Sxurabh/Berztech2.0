// src/components/Hero.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";

// Smooth counter animation
function AnimatedCounter({ value, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isVisible) {
        setIsVisible(true);
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isVisible, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}

// Text reveal animation for headline
function TextReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.23, 1, 0.32, 1] 
      }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

// Magnetic button effect
function MagneticButton({ children, href, variant = "primary" }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  const variants = {
    primary: "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800",
    secondary: "bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400"
  };

  return (
    <Link href={href} ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      >
        <CornerFrame 
          className={`inline-block ${variants[variant]} transition-colors duration-300`}
          bracketClassName="w-3 h-3 border-current opacity-40 group-hover:opacity-100 transition-opacity"
        >
          <span className="flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 font-jetbrains-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
            {children}
          </span>
        </CornerFrame>
      </motion.div>
    </Link>
  );
}

// Floating decorative elements
function FloatingElement({ delay, duration, children, className }) {
  return (
    <motion.div
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration, 
        delay, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Interactive grid background
function InteractiveGrid() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-white">
      {/* Base grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: `linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }}
      />
      
      {/* Spotlight effect */}
      <motion.div 
        className="pointer-events-none absolute inset-0"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,0,0,0.02), transparent 40%)`
        }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
      
      {/* Floating orbs */}
      <FloatingElement delay={0} duration={8} className="absolute top-[20%] left-[10%]">
        <div className="w-64 h-64 rounded-full bg-blue-500/3 blur-[100px]" />
      </FloatingElement>
      <FloatingElement delay={2} duration={10} className="absolute bottom-[10%] right-[15%]">
        <div className="w-96 h-96 rounded-full bg-purple-500/3 blur-[120px]" />
      </FloatingElement>
    </div>
  );
}

// Status badge with pulse
function StatusBadge() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-fit mb-6 sm:mb-8"
    >
      <CornerFrame className="px-3 py-1.5 bg-white border-neutral-200 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-jetbrains-mono font-medium uppercase tracking-widest text-neutral-500">
            Available for Q1 Projects
          </span>
        </div>
      </CornerFrame>
    </motion.div>
  );
}

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-0 lg:pb-0"
    >
      <InteractiveGrid />

      <motion.div 
        style={{ y: springY, opacity: springOpacity, scale: springScale }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Main Content */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          
          <StatusBadge />

          {/* Headline with text reveal */}
          <div className="space-y-1 sm:space-y-2 mb-6 sm:mb-8">
            <TextReveal delay={0.1}>
              <h1 className="font-space-grotesk text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-neutral-950 leading-[0.95] sm:leading-[0.9]">
                Engineering
              </h1>
            </TextReveal>
            
            <TextReveal delay={0.2}>
              <h1 className="font-space-grotesk text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight leading-[0.95] sm:leading-[0.9]">
                <span className="text-neutral-400">Digital</span>
              </h1>
            </TextReveal>
            
            <TextReveal delay={0.3}>
              <h1 className="font-space-grotesk text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight text-neutral-950 leading-[0.95] sm:leading-[0.9] relative inline-block">
                Excellence
                <motion.span 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute -bottom-2 left-0 right-0 h-2 sm:h-3 bg-neutral-100 origin-left -z-10"
                />
              </h1>
            </TextReveal>
          </div>

          {/* Description with fade up */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-xl lg:max-w-lg mb-8 sm:mb-10 relative"
          >
            <div className="hidden lg:block absolute -left-6 top-0 bottom-0 w-px bg-neutral-200" />
            
            <p className="font-jetbrains-mono text-sm sm:text-base text-neutral-600 leading-relaxed">
              We are a boutique engineering studio architecting high-performance 
              web applications for the next generation of digital leaders. 
              No templates, just pure code.
            </p>
          </motion.div>

          {/* CTAs with magnetic effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
          >
            <div className="group">
              <MagneticButton href="/contact" variant="primary">
                Start your project
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block"
                >
                  →
                </motion.span>
              </MagneticButton>
            </div>
            
            <div className="group">
              <MagneticButton href="/process" variant="secondary">
                Explore our process
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        {/* Stats Row - Bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 sm:mt-20 lg:mt-24 pt-6 sm:pt-8 border-t border-neutral-100"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { value: 50, suffix: "+", label: "Projects Delivered" },
              { value: 98, suffix: "%", label: "Client Retention" },
              { value: 12, suffix: "ms", label: "Avg Response" },
              { value: 5, suffix: "", label: "Years Experience" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="group cursor-default"
              >
                <div className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-950 tabular-nums tracking-tight group-hover:text-neutral-600 transition-colors duration-300">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-400 group-hover:text-neutral-500 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Corner Decorations */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute top-24 right-6 lg:top-32 lg:right-12 w-12 h-12 lg:w-16 lg:h-16 hidden sm:block"
      >
        <div className="w-full h-full border-t border-r border-neutral-200" />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="absolute bottom-24 left-6 lg:bottom-32 lg:left-12 w-12 h-12 lg:w-16 lg:h-16 hidden sm:block"
      >
        <div className="w-full h-full border-b border-l border-neutral-200" />
      </motion.div>

      {/* Scroll indicator - minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-neutral-200 origin-top"
        />
      </motion.div>
    </section>
  );
}