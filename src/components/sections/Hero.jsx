// src/components/Hero.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useInView } from "framer-motion";
import Link from "next/link";
import { FiSmartphone } from "react-icons/fi";
import { serviceCategories } from "@/data/marketing";
import { serviceColors } from "@/lib/design-tokens";
import { CornerFrame } from "@/components/ui/CornerFrame";
import clsx from "clsx";
import TrustBar from "./TrustBar";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

// --- DESKTOP: Expanded Ecosystem Visual ---
function EcosystemVisual({ shouldReduceMotion }) {
  return (
    <div className="relative w-full max-w-[650px] aspect-square flex items-center justify-center">

      {/* Background Ambience - Reduced blur on mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/10 blur-[60px] sm:blur-[80px] rounded-full -z-10" style={{ contain: "paint" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-purple-500/10 blur-[40px] sm:blur-[60px] rounded-full -z-10" style={{ contain: "paint" }} />

      {/* --- 1. GROWTH / MARKETING (Top Right - Pushed Out) --- */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 0.8, duration: 0.6 }}
        className="absolute top-[5%] right-[0%] z-30"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <CornerFrame
            className="bg-white/90 backdrop-blur-md border-neutral-200 shadow-xl p-3 min-w-[150px]"
            bracketClassName="w-2 h-2 border-neutral-400"
          >
            <div className={`flex items-center gap-2 mb-2 border-b pb-2 ${serviceColors.emerald.border}`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${serviceColors.emerald.bg}`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${serviceColors.emerald.bg}`}></span>
              </span>
              <span className={`text-[9px] font-jetbrains-mono uppercase tracking-wider ${serviceColors.emerald.text}`}>Growth</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className={`text-xl font-space-grotesk font-bold ${serviceColors.emerald.textDark}`}>+124%</div>
                <div className={`text-[9px] ${serviceColors.emerald.text}`}>ROI</div>
              </div>
              <div className="h-6 flex items-end gap-0.5">
                {[40, 60, 45, 70, 50, 80, 100].map((h, i) => (
                  <div key={i} className={`w-1.5 rounded-sm overflow-hidden h-full flex items-end ${serviceColors.emerald.bgLight}`}>
                    <motion.div
                      className={`w-full rounded-sm ${serviceColors.emerald.bg}`}
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
        transition={{ delay: shouldReduceMotion ? 0 : 1.0, duration: 0.6 }}
        className="absolute top-[12%] left-[-5%] z-20"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <CornerFrame
            className="bg-neutral-900 text-white shadow-2xl p-4 w-[170px]"
            bracketClassName="w-2 h-2 border-neutral-600"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-jetbrains-mono text-white uppercase">iOS / Android</span>
              <div className={`w-1.5 h-1.5 rounded-full ${serviceColors.purple.bg}`} />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${serviceColors.purple.bgLight} ${serviceColors.purple.border}`}>
                <FiSmartphone className={`w-4 h-4 ${serviceColors.purple.text}`} />
              </div>
              <div>
                <div className="text-xs font-medium text-white">Berztech</div>
                <div className="text-[8px] text-white">Deployed</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] text-purple-200/60">
                <span>Rating</span>
                <span>5.0 ★</span>
              </div>
              <div className="h-0.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full w-full ${serviceColors.purple.bg}`} />
              </div>
            </div>
          </CornerFrame>
        </motion.div>
      </motion.div>

      {/* --- 3. BRANDING / DESIGN (Bottom Right - Pushed Out) --- */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: shouldReduceMotion ? 0 : 1.2, duration: 0.6 }}
        className="absolute bottom-[8%] right-[5%] z-30"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <CornerFrame
            className="bg-white/95 backdrop-blur-md border-neutral-200 shadow-xl p-3 min-w-[140px]"
            bracketClassName="w-2 h-2 border-purple-500"
          >
            <div className="text-[9px] font-jetbrains-mono text-rose-500 uppercase tracking-wider mb-2">Identity</div>
            <div className="flex gap-2 justify-between">
              {[
                { bg: 'bg-neutral-900', label: 'Aa' },
                { bg: serviceColors.blue.bg, label: '#' },
                { bg: serviceColors.purple.bg, label: '#' },
                { bg: serviceColors.rose.bg, label: '#' }
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
        transition={{ delay: shouldReduceMotion ? 0 : 0.5, duration: 0.6 }}
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
                {!shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 bg-neutral-900/5"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-2.5 w-3/4 bg-neutral-200 rounded-full" />
                <div className="h-2 w-full bg-neutral-100 rounded-full" />
                <div className="h-2 w-5/6 bg-neutral-100 rounded-full" />

                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-[9px] font-medium rounded">React</span>
                  <span className="px-2 py-1 bg-neutral-100 text-neutral-700 text-[9px] font-medium rounded">Next.js</span>
                </div>
              </div>
            </div>

            {/* Code Block */}
            <div className="bg-neutral-950 rounded-lg p-3 font-jetbrains-mono text-[9px] leading-relaxed text-neutral-400 relative group">
              <div className="absolute top-3 right-3 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
              </div>
              <div><span className="text-purple-400">export default</span> <span className="text-purple-400">function</span> <span className="text-blue-400">App</span>() {'{'}</div>
              <div className="pl-3"><span className="text-purple-400">return</span> (</div>
              <div className="pl-6 text-neutral-400">{'<'}<span className="text-yellow-400">Performance</span> <span className="text-blue-300">mode</span>=<span className="text-emerald-400">"fast"</span> {'/>'}</div>
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
function OptimizedBackground({ enableInteraction, shouldReduceMotion }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (!enableInteraction || shouldReduceMotion) return;
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enableInteraction, shouldReduceMotion, mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(0,0,0,0.05), transparent 40%)`;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {enableInteraction && !shouldReduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background }}
        />
      )}
      <div className="absolute top-1/4 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-[60px] sm:blur-[100px] pointer-events-none" style={{ contain: "paint" }} />
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-purple-500/5 rounded-full blur-[40px] sm:blur-[80px] pointer-events-none" style={{ contain: "paint" }} />
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

function StatusBadge({ shouldReduceMotion }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
      className="inline-flex mb-4 sm:mb-6"
    >
      <CornerFrame className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white border-neutral-200 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-neutral-600" />
          </span>
          <span className="text-[9px] sm:text-[10px] font-jetbrains-mono font-medium uppercase tracking-wider text-neutral-600">
            Available for Q1 Projects
          </span>
        </div>
      </CornerFrame>
    </motion.div>
  );
}

// --- TABLET: Full Ecosystem Preview (1 + 3 layout) ---
function TabletEcosystemPreview({ shouldReduceMotion, isLoaded }) {
  const services = serviceCategories;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isLoaded ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.5 }}
      className="hidden md:block lg:hidden w-full my-6 sm:my-8"
    >
      <div className="space-y-4">
        {/* Featured Card - Full Width */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={isLoaded ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.5 }}
        >
          <CornerFrame
            className="bg-white/50 backdrop-blur-sm border-neutral-200 shadow-lg p-6"
            bracketClassName="w-2 h-2 border-neutral-400"
          >
            <div className="flex items-start gap-4">
              <div className={`text-3xl flex-shrink-0 ${serviceColors[services[0].color].text}`}>
                {(() => {
                  const Icon = services[0].icon;
                  return <Icon className="w-6 h-6" />;
                })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-space-grotesk font-semibold text-neutral-900">
                    {services[0].title}
                  </h3>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{services[0].subtitle}</p>
                <p className="text-xs font-jetbrains-mono text-neutral-500 uppercase tracking-wider">
                  {services[0].description}
                </p>
              </div>
            </div>
          </CornerFrame>
        </motion.div>

        {/* Three Cards Below - Grid Layout */}
        <div className="grid grid-cols-3 gap-4">
          {services.slice(1).map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ y: 10, opacity: 0 }}
                animate={isLoaded ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
                transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.6 + (idx * 0.1) }}
              >
                <CornerFrame
                  className="bg-white/50 backdrop-blur-sm border-neutral-200 shadow-lg p-4 h-full"
                  bracketClassName="w-2 h-2 border-neutral-400"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`text-2xl ${serviceColors[service.color].text}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xs font-space-grotesk font-semibold text-neutral-900">
                      {service.title}
                    </h4>
                    <p className="text-[11px] text-neutral-600 leading-tight">
                      {service.subtitle}
                    </p>
                    <div className="text-[10px] font-jetbrains-mono text-neutral-500 uppercase tracking-wider pt-1">
                      {service.items.join(" • ")}
                    </div>
                  </div>
                </CornerFrame>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// --- MOBILE: Service Cards (Full Width Stacked) ---
function MobileServiceCards({ shouldReduceMotion, isLoaded }) {
  const services = serviceCategories;

  return (
    <div className="grid grid-cols-1 gap-3 md:hidden my-6 sm:my-8">
      {services.map((service, idx) => {
        const Icon = service.icon;
        return (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 10 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.4 + (idx * 0.1) }}
          >
            <CornerFrame
              className="bg-white/50 backdrop-blur-sm border-neutral-200 shadow-lg p-4 hover:shadow-xl transition-shadow duration-300"
              bracketClassName="w-2 h-2 border-neutral-400"
            >
              <div className="flex items-start gap-3">
                <div className={`text-2xl flex-shrink-0 mt-0.5 ${serviceColors[service.color].text}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-space-grotesk font-semibold text-neutral-900 mb-1">
                    {service.title}
                  </h3>
                  <p className="text-[12px] text-neutral-600 leading-tight mb-2">
                    {service.description}
                  </p>
                  <p className="text-[11px] font-jetbrains-mono text-neutral-500 uppercase tracking-wider">
                    {service.metric}
                  </p>
                </div>
              </div>
            </CornerFrame>
          </motion.div>
        );
      })}
    </div>
  );
}

// --- MAIN HERO COMPONENT ---
export default function Hero() {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const inView = useInView(containerRef, { margin: "-20%" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  // Defer animation initialization to after hydration
  useEffect(() => {
    // Small delay to allow React to commit DOM
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarsePointer(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setShouldReduceMotion(mq.matches);
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
      <OptimizedBackground enableInteraction={!isCoarsePointer && inView} shouldReduceMotion={shouldReduceMotion} />

      <motion.div
        style={{ y: springY }}
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
            <div className="lg:col-span-7 xl:col-span-6 order-1 lg:order-1">
              {isLoaded && <StatusBadge shouldReduceMotion={shouldReduceMotion} />}

              <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                {isLoaded && (
                  <>
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
                        {!shouldReduceMotion && (
                          <motion.span
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.8, ease: [0.23, 1, 0.32, 1] }}
                            className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-2 sm:h-3 bg-emerald-100 origin-left -z-10"
                          />
                        )}
                      </h1>
                    </TextReveal>
                  </>
                )}
              </div>

              {isLoaded && (
                <>
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
                      {!shouldReduceMotion && (
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          →
                        </motion.span>
                      )}
                    </MagneticButton>

                    <MagneticButton href="/process" variant="secondary" className="group w-full sm:w-auto justify-center" coarse={isCoarsePointer}>
                      Explore our process
                    </MagneticButton>
                  </motion.div>

                  {/* Tablet Ecosystem Preview - Visible only on md and below lg */}
                  <TabletEcosystemPreview shouldReduceMotion={shouldReduceMotion} isLoaded={isLoaded} />

                  {/* Mobile/Tablet Service Cards - Visible only on md and below */}
                  <MobileServiceCards shouldReduceMotion={shouldReduceMotion} isLoaded={isLoaded} />

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
                </>
              )}
            </div>

            {/* Visual: Desktop only (lg and up) to prevent mobile lag */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 order-2 lg:order-2 items-center justify-center relative">
              {/* Scaling wrapper */}
              {isLoaded && (
                <div className="lg:scale-100 origin-center w-full flex justify-center lg:my-0">
                  <EcosystemVisual shouldReduceMotion={shouldReduceMotion} />
                </div>
              )}
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
