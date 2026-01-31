"use client";
import React, { useEffect, useRef, useState } from "react";

/* ---------------- Parallax Hook ---------------- */
function useParallax(strength = 10) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateX(${y * -strength}deg) rotateY(${x * strength}deg)`;
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    };

    const leave = () => {
      el.style.transform = "rotateX(0deg) rotateY(0deg)";
      el.style.setProperty("--x", `50%`);
      el.style.setProperty("--y", `50%`);
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);

  return ref;
}

/* ---------------- Bento Card Wrapper ---------------- */
function BentoCard({ title, subtitle, tag, children, className = "", dark }) {
  const ref = useParallax(4);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl ${
        dark 
          ? "bg-neutral-950 text-white border border-neutral-800" 
          : "bg-white text-neutral-950 border border-neutral-200"
      } ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Dynamic Cursor Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background:
            "radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.1), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between pointer-events-none">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`h-1.5 w-1.5 rounded-full ${dark ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
            <p className={`text-xs font-mono uppercase tracking-widest font-bold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
              {tag}
            </p>
          </div>
          <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
          <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-neutral-400" : "text-neutral-500"}`}>
            {subtitle}
          </p>
        </div>
        {/* Children container with pointer-events-auto so interactive elements work */}
        <div className="mt-8 relative pointer-events-auto h-full min-h-[140px] flex items-end">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Card 1: Architecture (The Connector) ---------------- */
function CrossPlatformCard() {
  return (
    <BentoCard
      tag="Architecture"
      title="Unified Cross-Platform Architecture"
      subtitle="One scalable codebase delivering seamless performance across web, mobile, and desktop."
      className="lg:col-span-2 lg:row-span-2 bg-neutral-50"
    >
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Connection Visualization */}
      <div className="absolute inset-0 top-32 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full px-8 pb-8 flex items-end justify-center gap-4 sm:gap-8">
          
          {/* Connecting Lines (Behind) */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-48 h-32 border-b-2 border-x-2 border-neutral-200 rounded-b-3xl -z-10 hidden sm:block"></div>
          <div className="absolute bottom-40 left-1/2 -translate-x-1/2 h-12 w-0.5 bg-neutral-200 -z-10 hidden sm:block"></div>

          {/* Left Element: Desktop/Web */}
          <div className="relative group/desktop bg-white border border-neutral-200 shadow-lg rounded-lg w-1/2 h-40 sm:h-48 p-2 flex flex-col transition-transform duration-500 hover:-translate-y-2">
            <div className="flex gap-1.5 mb-2 border-b border-neutral-100 pb-2">
              <div className="w-2 h-2 rounded-full bg-red-400/80"></div>
              <div className="w-2 h-2 rounded-full bg-amber-400/80"></div>
              <div className="w-2 h-2 rounded-full bg-green-400/80"></div>
            </div>
            <div className="flex-1 bg-neutral-50 rounded border border-neutral-100 flex gap-2 p-2 overflow-hidden">
               <div className="w-1/4 h-full bg-neutral-200/50 rounded-sm"></div>
               <div className="w-3/4 h-full space-y-2">
                  <div className="w-full h-8 bg-neutral-200/50 rounded-sm"></div>
                  <div className="w-2/3 h-4 bg-neutral-200/30 rounded-sm"></div>
                  <div className="flex gap-2 mt-4">
                     <div className="w-1/2 h-12 bg-blue-50 rounded-sm border border-blue-100"></div>
                     <div className="w-1/2 h-12 bg-purple-50 rounded-sm border border-purple-100"></div>
                  </div>
               </div>
            </div>
            {/* Label Badge */}
            <div className="absolute -top-3 left-4 bg-neutral-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">
              Web & Desktop
            </div>
          </div>

          {/* Central Core (Hub) */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-xl border border-neutral-200 shadow-xl flex items-center justify-center animate-pulse-slow">
              <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>

          {/* Right Element: Mobile */}
          <div className="relative group/mobile bg-neutral-900 border border-neutral-800 shadow-xl rounded-[2rem] w-24 sm:w-32 h-44 sm:h-56 p-1.5 flex flex-col transition-transform duration-500 hover:-translate-y-4">
            <div className="w-10 h-4 bg-black rounded-b-xl mx-auto absolute top-1.5 left-1/2 -translate-x-1/2 z-10"></div>
            <div className="flex-1 bg-neutral-800 rounded-[1.7rem] overflow-hidden relative">
               {/* UI Mockup inside phone */}
               <div className="w-full h-full bg-neutral-900 flex flex-col p-3 pt-8 space-y-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800"></div>
                  <div className="w-full h-24 bg-neutral-800/50 rounded-lg border border-white/5"></div>
                  <div className="w-full h-8 bg-blue-500/20 rounded border border-blue-500/30"></div>
               </div>
            </div>
             {/* Label Badge */}
             <div className="absolute -right-2 top-12 rotate-90 bg-white text-neutral-900 text-[10px] font-mono px-2 py-0.5 rounded shadow-sm">
              Native Mobile
            </div>
          </div>

        </div>
      </div>
    </BentoCard>
  );
}

/* ---------------- Card 2: Performance (The Histogram) ---------------- */
function RealtimeCard() {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    // Initialize bars
    setBars(Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 20));

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 70) + 20));
    }, 1500); 

    return () => clearInterval(interval);
  }, []);

  return (
    <BentoCard
      tag="Performance"
      title="Real-Time Data"
      subtitle="Instant updates and event-driven systems built for high-performance applications."
      dark
      className="bg-neutral-950"
    >
      <div className="relative w-full mt-2">
        {/* Header with Pulse */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-mono text-neutral-300 uppercase">Live System</span>
           </div>
           <div className="text-[10px] font-mono text-neutral-500">98.4% Load</div>
        </div>

        {/* Histogram Visualization */}
        <div className="flex items-end justify-between h-24 gap-1 sm:gap-2 px-1">
          {bars.map((height, i) => (
            <div 
              key={i} 
              className="w-full bg-neutral-800 rounded-t-sm relative group overflow-hidden"
              style={{ height: `${height}%`, transition: 'height 0.5s ease-in-out' }}
            >
               <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-cyan-400/80 opacity-60 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
        
        <div className="h-px w-full bg-neutral-800 mt-0"></div>
      </div>
    </BentoCard>
  );
}

/* ---------------- Card 3: Intelligence (Glass & Glow) ---------------- */
function AICard() {
  return (
    <BentoCard
      tag="Intelligence"
      title="AI-Ready Core"
      subtitle="Integrate AI copilots and intelligent workflows directly into your platform."
      className="bg-white"
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
         {/* Enhanced Gradients */}
         <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
         <div className="absolute left-10 bottom-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full mt-4 flex justify-center pb-4">
        {/* Glassmorphism Card */}
        <div className="relative w-full max-w-[200px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-4 flex flex-col gap-3 animate-float">
           <div className="flex gap-2 items-center border-b border-black/5 pb-2">
              <div className="w-6 h-6 rounded bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-[10px]">✨</div>
              <div className="h-2 w-16 bg-neutral-200/50 rounded-full"></div>
           </div>
           <div className="space-y-2">
              <div className="h-1.5 w-full bg-neutral-100 rounded-full"></div>
              <div className="h-1.5 w-2/3 bg-neutral-100 rounded-full"></div>
              <div className="h-1.5 w-3/4 bg-neutral-100 rounded-full"></div>
           </div>
           <div className="mt-1 flex justify-end">
              <div className="h-4 w-12 bg-black/5 rounded flex items-center justify-center">
                 <div className="h-1 w-6 bg-black/10 rounded-full"></div>
              </div>
           </div>
        </div>
      </div>
    </BentoCard>
  );
}

/* ---------------- Main Layout ---------------- */
export default function BentoGrid() {
  return (
    <section className="py-24 px-6 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl mb-16">
          <h2 className="font-display text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
            Engineered for scale. <br/>Designed for the future.
          </h2>
          <p className="mt-6 text-lg text-neutral-600 font-light max-w-xl">
            We build high-performance digital products powered by modern architecture,
            real-time systems, and AI-driven capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-2 lg:h-[650px]">
          <CrossPlatformCard />
          <RealtimeCard />
          <AICard />
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-custom {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
           animation: pulse-custom 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </section>
  );
}