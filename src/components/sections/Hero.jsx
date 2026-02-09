// src/components/Hero.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useInView } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";
import clsx from "clsx";
import TrustBar from "./TrustBar";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

// --- DESKTOP: Expanded Ecosystem Visual ---
function EcosystemVisual() {
  return (
    <div className="relative w-full max-w-[650px] aspect-square flex items-center justify-center">

      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 blur-[80px] rounded-full -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-purple-500/10 blur-[60px] rounded-full -z-10" />

      {/* --- 1. GROWTH / MARKETING (Top Right - Pushed Out) --- */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute top-[5%] right-[0%] z-30"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <CornerFrame
            className="bg-white/90 backdrop-blur-md border-neutral-200 shadow-xl p-3 min-w-[150px]"
            bracketClassName="w-2 h-2 border-blue-500"
          >
            <div className="flex items-center gap-2 mb-2 border-b border-neutral-100 pb-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              <span className="text-[9px] font-jetbrains-mono text-neutral-500 uppercase tracking-wider">Growth</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-space-grotesk font-bold text-neutral-900">+124%</div>
                <div className="text-[9px] text-neutral-500">ROI</div>
              </div>
              <div className="h-6 flex items-end gap-0.5">
                {[40, 60, 45, 70, 50, 80, 100].map((h, i) => (
                  <div key={i} className="w-1.5 bg-blue-100 rounded-sm overflow-hidden h-full flex items-end">
                    <motion.div
                      className="w-full bg-blue-500 rounded-sm"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: 1.2 + (i * 0.1) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CornerFrame>
        </motion.div>
      </motion.div>

      {/* --- 2. MOBILE APP (Top Left - Pushed Out) --- */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="absolute top-[12%] left-[-5%] z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <CornerFrame
            className="bg-neutral-900 text-white shadow-2xl p-4 w-[170px]"
            bracketClassName="w-2 h-2 border-neutral-600"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-jetbrains-mono text-neutral-300 uppercase">iOS / Android</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M5 2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h14V4H5z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium">Berztech</div>
                <div className="text-[8px] text-neutral-400">Deployed</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] text-neutral-300">
                <span>Rating</span>
                <span>5.0 ★</span>
              </div>
              <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full w-full bg-indigo-500" />
              </div>
            </div>
          </CornerFrame>
        </motion.div>
      </motion.div>

      {/* --- 3. BRANDING / DESIGN (Bottom Right - Pushed Out) --- */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-[8%] right-[5%] z-30"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <CornerFrame
            className="bg-white/95 backdrop-blur-md border-neutral-200 shadow-xl p-3 min-w-[140px]"
            bracketClassName="w-2 h-2 border-purple-500"
          >
            <div className="text-[9px] font-jetbrains-mono text-neutral-600 uppercase tracking-wider mb-2">Identity</div>
            <div className="flex gap-2 justify-between">
              {[
                { bg: 'bg-neutral-900', label: 'Aa' },
                { bg: 'bg-emerald-500', label: '#' },
                { bg: 'bg-blue-500', label: '#' },
                { bg: 'bg-purple-500', label: '#' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-md shadow-sm ${item.bg} flex items-center justify-center text-[8px] text-white`}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </CornerFrame>
        </motion.div>
      </motion.div>

      {/* --- 4. WEB DEVELOPMENT (Center Anchor) --- */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 w-[340px]"
      >
        <CornerFrame
          className="bg-white/80 backdrop-blur-xl border-neutral-200 shadow-2xl p-0 overflow-hidden"
          bracketClassName="w-3 h-3 border-neutral-900"
        >
          {/* Browser Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-white/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/20 border border-red-400/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20 border border-amber-400/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20 border border-emerald-400/30" />
            </div>
            <div className="flex-1 bg-neutral-100/50 rounded-md text-[9px] text-neutral-600 py-1.5 px-3 text-center font-jetbrains-mono">
              berztech.com/build
            </div>
          </div>

          {/* Web Content Area */}
          <div className="p-5 space-y-4">
            {/* Mock Hero */}
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-neutral-100 rounded-lg shrink-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-neutral-200 to-white" />
                <motion.div
                  className="absolute inset-0 bg-neutral-900/5"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-2.5 w-3/4 bg-neutral-200 rounded-full" />
                <div className="h-2 w-full bg-neutral-100 rounded-full" />
                <div className="h-2 w-5/6 bg-neutral-100 rounded-full" />

                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-medium rounded">React</span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[9px] font-medium rounded">Next.js</span>
                </div>
              </div>
            </div>

            {/* Code Block */}
            <div className="bg-neutral-950 rounded-lg p-3 font-jetbrains-mono text-[9px] leading-relaxed text-neutral-400 relative group">
              <div className="absolute top-3 right-3 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              </div>
              <div><span className="text-purple-400">export default</span> <span className="text-blue-400">function</span> <span className="text-yellow-400">App</span>() {'{'}</div>
              <div className="pl-3"><span className="text-purple-400">return</span> (</div>
              <div className="pl-6 text-emerald-300">{'<Performance mode="fast" />'}</div>
              <div className="pl-3">);</div>
              <div>{'}'}</div>
            </div>
          </div>
        </CornerFrame>
      </motion.div>
    </div>
  );
}

// --- MOBILE: Dedicated Service Grid ---
function MobileServiceGrid() {
  const cards = [
    {
      title: "Web Dev",
      icon: "⚡",
      desc: "Next.js / React",
      bg: "bg-blue-50 border-blue-100",
      text: "text-blue-600"
    },
    {
      title: "Mobile Apps",
      icon: "📱",
      desc: "iOS & Android",
      bg: "bg-purple-50 border-purple-100",
      text: "text-purple-600"
    },
    {
      title: "Marketing",
      icon: "📈",
      desc: "SEO & Growth",
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-600"
    },
    {
      title: "Branding",
      icon: "🎨",
      desc: "Identity & UI",
      bg: "bg-amber-50 border-amber-100",
      text: "text-amber-600"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto mt-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + (i * 0.1) }}
        >
          <div className={`p-4 ${card.bg} h-full flex flex-col justify-between min-h-[100px]`}>
            <div className="flex grow justify-between items-start mb-2">
              <span className="text-xl">{card.icon}</span>
              <div className={`w-1.5 h-1.5 rounded-full ${card.text.replace('text', 'bg')}`} />
            </div>
            <div>
              <h3 className={`font-space-grotesk font-medium text-sm ${card.text} mb-0.5`}>{card.title}</h3>
              <p className="font-jetbrains-mono text-[9px] text-neutral-500 uppercase tracking-wide">{card.desc}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}



// --- Magnetic button ---
function MagneticButton({ children, href, variant = "primary", className, coarse }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const variants = {
    primary: "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800",
    secondary: "bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
  };

  return (
    <Link
      href={href}
      className={className}
      onMouseMove={(e) => {
        if (coarse) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.1;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.1;
        mx.set(x);
        my.set(y);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        style={{ x: mx, y: my }}
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

// --- Optimized background ---
function OptimizedBackground({ enableInteraction }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (!enableInteraction) return;
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enableInteraction, mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(0,0,0,0.05), transparent 40%)`;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {enableInteraction && (
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

// --- MAIN HERO COMPONENT ---
export default function Hero() {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const inView = useInView(containerRef, { margin: "-20%" });

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

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarsePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "auto" }}
    >
      <OptimizedBackground enableInteraction={!isCoarsePointer && inView} />

      <motion.div
        style={{ y: springY, opacity: springOpacity }}
        className="relative z-10 w-full flex flex-col"
      >
        <div className={clsx(
          "flex flex-col justify-center",
          "py-6 sm:py-8 lg:py-12",
          "mx-auto max-w-5xl",
          "w-full",
          "px-4 sm:px-6 lg:px-8"
        )}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 xl:col-span-6 order-2 lg:order-1">
              <StatusBadge />

              <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                <TextReveal delay={0.1}>
                  <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight text-neutral-950 leading-[0.95]">
                    Engineering
                  </h1>
                </TextReveal>
                <TextReveal delay={0.2}>
                  <h1 className="font-space-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium tracking-tight leading-[0.95] text-neutral-500">
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <MagneticButton href="/contact" variant="primary" className="group w-full sm:w-auto justify-center" coarse={isCoarsePointer}>
                  <span>Start your project</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.span>
                </MagneticButton>

                <MagneticButton href="/process" variant="secondary" className="group w-full sm:w-auto justify-center" coarse={isCoarsePointer}>
                  Explore our process
                </MagneticButton>
              </motion.div>

              {/* Mobile Service Grid: Visible ONLY on small screens */}
              <div className="block lg:hidden">
                <MobileServiceGrid />
              </div>

              {/* Stats: Visible on all screens, adjusting padding for desktop/mobile */}
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

            {/* Right Visual: Visible ONLY on Desktop */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 order-1 lg:order-2 items-center justify-center">
              <EcosystemVisual />
            </div>
          </div>
        </div>

        <div className="w-full mt-4 sm:mt-6">
          <TrustBar />
        </div>
      </motion.div>
    </section>
  );
}
