"use client";
import React, { useState, useEffect, useRef } from "react";
import ContactSection from "@/components/ContactSection";
import Container from "@/components/Container";
import FadeIn from "@/components/FadeIn";
import Services from "@/components/Services";
import Button from "@/components/Button";
import Clients from "@/components/Clients";
import CodeShowcase from "@/components/CodeShowcase";
import BentoGrid from "@/components/BentoGrid";
import { CornerFrame } from "@/components/CornerFrame";

/* --- PERFORMANCE OPTIMIZED: Hero Background with Reduced Motion Support --- */
function HeroBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Throttled mouse tracking using RAF
    const handleMouseMove = (event) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
    };

    const updatePosition = () => {
      setMousePosition(mouseRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };

    if (!prefersReducedMotion) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      rafRef.current = requestAnimationFrame(updatePosition);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-white">
      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{ 
          backgroundImage: `linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`, 
          backgroundSize: 'clamp(20px, 4vw, 40px) clamp(20px, 4vw, 40px)'
        }}
      />
      
      {/* Interactive Spotlight */}
      {!prefersReducedMotion && (
        <div 
          className="pointer-events-none absolute -inset-px transition-opacity duration-500"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.03), transparent 40%)`,
          }}
        />
      )}

      {/* Depth Orbs with CSS Animation */}
      <div className="absolute top-[-10%] left-[-10%] h-[40vw] max-h-[600px] w-[40vw] max-w-[600px] rounded-full bg-blue-500/5 blur-[100px] animate-orb-float" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[45vw] max-h-[700px] w-[45vw] max-w-[700px] rounded-full bg-purple-500/5 blur-[120px] animate-orb-float" style={{ animationDelay: '-2s' }} />
    </div>
  );
}

/* --- NEW: Live Stats Ticker for Social Proof --- */
function LiveStatsTicker() {
  const stats = [
    { value: "99.9%", label: "Uptime SLA" },
    { value: "<50ms", label: "Global Latency" },
    { value: "2M+", label: "Daily Requests" },
    { value: "100%", label: "Type-Safe" },
  ];

  return (
    <div className="w-full border-y border-neutral-200 bg-neutral-50/50 backdrop-blur-sm overflow-hidden">
      <div className="flex animate-ticker-scroll hover:pause-animation">
        {[...stats, ...stats, ...stats].map((stat, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 px-8 sm:px-12 py-4 border-r border-neutral-200 flex items-center gap-3"
          >
            <span className="font-space-grotesk text-xl sm:text-2xl font-bold text-neutral-900 tabular-nums">
              {stat.value}
            </span>
            <span className="font-jetbrains-mono text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider whitespace-nowrap">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- ENHANCED: Status Badge with Pulse Effect --- */
function StatusBadge() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate occasional status checks
    const interval = setInterval(() => {
      setIsOnline(prev => Math.random() > 0.05); // 95% uptime simulation
      setTimeout(() => setIsOnline(true), 1000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-fit mb-6 sm:mb-8 group cursor-default">
      <CornerFrame 
        className="px-3 sm:px-4 py-2 backdrop-blur-md bg-white/80 transition-all duration-300 group-hover:shadow-lg" 
        bracketClassName="w-3 h-3 sm:w-4 sm:h-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className={clsx(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              isOnline ? "bg-emerald-400" : "bg-amber-400"
            )}></span>
            <span className={clsx(
              "relative inline-flex rounded-full h-full w-full",
              isOnline ? "bg-emerald-500" : "bg-amber-500"
            )}></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-700">
              {isOnline ? "Available for Q1 2025" : "Limited Slots Remaining"}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400">
              {isOnline ? "2 spots left • Response < 2hrs" : "Check back soon"}
            </span>
          </div>
        </div>
      </CornerFrame>
    </div>
  );
}

/* --- NEW: Scroll Progress Indicator --- */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-neutral-100 z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* --- NEW: Floating Action Button for Mobile --- */
function FloatingContact() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href="/contact"
      className="fixed bottom-6 right-6 z-40 bg-neutral-950 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform lg:hidden animate-slide-up"
      aria-label="Contact Us"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </a>
  );
}

import clsx from "clsx";

export default function Home() {
  return (
    <main className="w-full bg-white relative selection:bg-neutral-900 selection:text-white">
      <ScrollProgress />
      <FloatingContact />
      
      {/* 1. HERO SECTION - Enhanced with better visual hierarchy */}
      <div className="relative pt-24 sm:pt-32 lg:pt-48 pb-16 sm:pb-24 lg:pb-32 isolate min-h-[90vh] flex flex-col justify-center">
        <HeroBackground />

        <Container>
          <FadeIn>
            <StatusBadge />

            {/* Pre-headline for context */}
            <p className="font-jetbrains-mono text-[10px] sm:text-xs text-neutral-400 uppercase tracking-[0.3em] mb-4 sm:mb-6">
              Enterprise Web Development Studio
            </p>

            <h1 className="font-space-grotesk text-5xl sm:text-7xl lg:text-[100px] xl:text-[120px] font-medium tracking-tight text-neutral-950 leading-[0.9] mb-6 sm:mb-8">
              We Build
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient-shift">
                  Digital Engines
                </span>
                {/* Animated underline */}
                <svg className="absolute w-full h-2 -bottom-1 left-0 sm:h-3 sm:-bottom-2" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path 
                    d="M0 5 Q 50 10 100 5" 
                    stroke="url(#gradient)" 
                    strokeWidth="3" 
                    fill="none"
                    className="animate-draw-line"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#9333ea" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
            
            {/* Subtitle with better readability */}
            <div className="max-w-xl sm:max-w-2xl mb-8 sm:mb-12">
              <p className="font-jetbrains-mono text-base sm:text-lg lg:text-xl leading-relaxed text-neutral-600">
                Full-stack TypeScript architecture for SaaS platforms that scale. 
                From zero to IPO-ready infrastructure.
              </p>
            </div>
            
            {/* CTA Group with social proof */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
              <Button href="/contact" className="w-full sm:w-auto group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Your Project
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Button>
              
              <Button href="/process" variant="secondary" className="w-full sm:w-auto">
                View Case Studies
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 sm:mt-16 pt-8 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {[
                { num: "50+", label: "Shipped Products" },
                { num: "$40M+", label: "Client Valuation" },
                { num: "5★", label: "Client Rating" },
                { num: "24/7", label: "Support" },
              ].map((stat) => (
                <div key={stat.label} className="group cursor-default">
                  <div className="font-space-grotesk text-2xl sm:text-3xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {stat.num}
                  </div>
                  <div className="font-jetbrains-mono text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </Container>
      </div>

      {/* Live Stats Ticker */}
      <LiveStatsTicker />

      {/* 2. CLIENTS with enhanced spacing */}
      <div className="py-16 sm:py-20 lg:py-24">
        <Clients />
      </div>

      {/* 3. CODE SHOWCASE */}
      <CodeShowcase />

      {/* 4. BENTO GRID */}
      <BentoGrid />

      {/* 5. SERVICES */}
      <Services />

      {/* 6. CONTACT */}
      <ContactSection />

      {/* Global Styles for animations */}
      <style jsx global>{`
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.7; }
          66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.4; }
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        @keyframes draw-line {
          0% { stroke-dasharray: 0 100; }
          100% { stroke-dasharray: 100 0; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-orb-float {
          animation: orb-float 20s ease-in-out infinite;
        }
        .animate-ticker-scroll {
          animation: ticker-scroll 30s linear infinite;
        }
        .animate-ticker-scroll:hover,
        .pause-animation {
          animation-play-state: paused;
        }
        .animate-draw-line {
          stroke-dasharray: 100;
          animation: draw-line 1.5s ease-out forwards;
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  );
}