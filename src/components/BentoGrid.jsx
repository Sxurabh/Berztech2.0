"use client";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CornerFrame } from "@/components/CornerFrame";

/* ---------------- Parallax Hook ---------------- */
function useParallax(strength = 6) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only apply parallax on desktop (lg screens)
    if (window.innerWidth < 1024) return;

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      
      el.style.transform = `perspective(1000px) rotateX(${y * -strength}deg) rotateY(${x * strength}deg)`;
    };

    const leave = () => {
      el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
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
function BentoCard({ 
  title, 
  subtitle, 
  tag, 
  children, 
  className = "", 
  dark = false,
  // CUSTOMIZATION: Default to slightly bolder corners than buttons
  bracketClass = "w-5 h-5 border-2" 
}) {
  const ref = useParallax(4);

  return (
    <div className={clsx("h-full min-h-[320px]", className)}>
      <CornerFrame
        ref={ref}
        // Pass the custom styling to your CornerFrame component
        bracketClassName={bracketClass}
        className={clsx(
          "h-full w-full transition-all duration-500 ",
          dark ? "bg-neutral-950 text-blue-400 hover:text-black" : "bg-white text-black"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className={clsx(
          "relative h-full overflow-hidden p-6 sm:p-8 flex flex-col",
          dark ? "text-white" : "text-neutral-950"
        )}>
          
          {/* Background Grid Pattern */}
          <div 
            className={clsx("absolute inset-0 opacity-[0.03] pointer-events-none", dark ? "bg-white" : "bg-black")}
            style={{ 
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }} 
          />

          {/* Header */}
          <div className="relative z-10 pointer-events-none mb-4">
            <div className="flex items-center gap-2 mb-3">
               <div className={clsx("h-1 w-1 rounded-full", dark ? "bg-blue-400" : "bg-neutral-950")} />
               <p className={clsx("font-jetbrains-mono text-[10px] uppercase tracking-widest font-bold", dark ? "text-blue-400" : "text-neutral-500")}>
                 {tag}
               </p>
            </div>
            <h3 className="font-space-grotesk text-2xl font-medium tracking-tight">{title}</h3>
            <p className={clsx("mt-3 text-sm leading-relaxed max-w-[90%]", dark ? "text-neutral-400" : "text-neutral-600")}>
              {subtitle}
            </p>
          </div>
          
          {/* Content Area */}
          <div className="relative w-full flex-1 flex items-end justify-center pointer-events-auto min-h-[180px]">
             {children}
          </div>
        </div>
      </CornerFrame>
    </div>
  );
}

/* ---------------- Card 1: Architecture (Upscaled) ---------------- */
function CrossPlatformCard() {
  return (
    <BentoCard
      tag="Architecture"
      title="Unified Core"
      subtitle="One scalable codebase deploying to Web, iOS, and Android seamlessly."
      className="lg:col-span-2 lg:row-span-2"
    >
      <div className="absolute inset-0 flex items-center justify-center translate-y-4 sm:translate-y-8">
         {/* Scaled Wrapper */}
         <div className="relative w-full max-w-[450px] aspect-[4/3] scale-110 sm:scale-125 origin-bottom">
            
            {/* Connector Lines */}
            <svg className="absolute inset-0 w-full h-full text-neutral-200" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
               <path d="M200 150 L 100 240" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
               <path d="M200 150 L 300 240" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
               <path d="M200 150 L 200 60" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>

            {/* Central Node */}
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-[80%] w-24 h-24 bg-white  border-neutral-100 shadow-2xl flex items-center justify-center z-20 hover:scale-105 transition-transform cursor-default ">
               <div className="w-10 h-10 bg-neutral-900 rounded-lg" />
            </div>

            {/* Sub Nodes */}
            <div className="absolute bottom-[10%] left-[15%] w-16 h-16 bg-neutral-50 border border-neutral-200 shadow-lg flex items-center justify-center z-10 hover:-translate-y-1 transition-transform cursor-default ">
               <span className="font-jetbrains-mono text-xs font-bold text-neutral-400">WEB</span>
            </div>
            <div className="absolute bottom-[10%] right-[15%] w-16 h-16 bg-neutral-50 border border-neutral-200 shadow-lg flex items-center justify-center z-10 hover:-translate-y-1 transition-transform cursor-default ">
               <span className="font-jetbrains-mono text-xs font-bold text-neutral-400">APP</span>
            </div>
            
            {/* Badge */}
            <div className="absolute top-[10%] left-[50%] -translate-x-1/2 bg-neutral-100 border border-neutral-200 px-3 py-1  shadow-sm">
               <span className="font-jetbrains-mono text-[10px] font-bold text-neutral-500 tracking-wider">v2.0 STABLE</span>
            </div>
         </div>
      </div>
    </BentoCard>
  );
}

/* ---------------- Card 2: Performance (Responsive Terminal) ---------------- */
function RealtimeCard() {
  const [logs, setLogs] = useState([
    "> init_sequence()",
    "> connecting...",
    "> stream_active: true",
  ]);

  useEffect(() => {
    const messages = ["> packet_rcvd [2kb]", "> latency: 12ms", "> syncing_db...", "> event_emitted","> userlogged_in","> user_clicked_cart","> payment_recieved","> closing_page","> exit_terminal","> event_emitted", ];
    const interval = setInterval(() => {
      setLogs(prev => [...prev, messages[Math.floor(Math.random() * messages.length)]].slice(-5));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <BentoCard
      tag="Infrastructure"
      title="Real-Time"
      subtitle="Event-driven systems built for sub-millisecond updates."
      dark
      className="lg:col-span-1"
    >
      <div className="w-full bg-neutral-900 border border-neutral-800 p-4 font-jetbrains-mono text-[10px] text-green-400 leading-5 opacity-90 relative overflow-hidden rounded-md shadow-inner h-32 flex flex-col justify-end">
         {/* Scanline Effect */}
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan pointer-events-none" />
         
         <div className="absolute top-0 left-0 right-0 flex justify-between border-b border-neutral-800 p-2 bg-neutral-900/90 z-10">
            <span>TERMINAL</span>
            <span className="animate-pulse text-green-500">● LIVE</span>
         </div>
         
         <div className="flex flex-col gap-1 mt-8">
            {logs.map((log, i) => (
               <div key={i} className="animate-fadeIn truncate">{log}</div>
            ))}
         </div>
      </div>
    </BentoCard>
  );
}

/* ---------------- Card 3: Intelligence ---------------- */
function AICard() {
  return (
    <BentoCard
      tag="Intelligence"
      title="AI Agents"
      subtitle="Embed intelligent workflows directly into your platform."
      className="lg:col-span-1"
    >
      <div className="relative w-full h-full flex items-center justify-center py-6">
         {/* Background Lines */}
         <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
            <div className="w-px h-full max-h-[120px] bg-neutral-400" />
            <div className="w-px h-full max-h-[160px] bg-neutral-400" />
            <div className="w-px h-full max-h-[120px] bg-neutral-400" />
         </div>

         {/* The "Brain" Node */}
         <div className="relative bg-white border border-neutral-200 px-5 py-3 shadow-lg z-10 hover:scale-105 transition-transform cursor-default rounded-lg">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
               <span className="font-jetbrains-mono text-xs font-bold tracking-wider text-neutral-800">MODEL_READY</span>
            </div>
         </div>
         
         {/* Orbiting Particles */}
         <div className="absolute top-1/2 left-[20%] w-1.5 h-1.5 bg-neutral-400 rounded-full animate-ping" />
         <div className="absolute top-[30%] right-[20%] w-1.5 h-1.5 bg-neutral-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
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
          <h2 className="font-space-grotesk text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
            Engineered for scale. <br/>
            <span className="text-neutral-400">Designed for longevity.</span>
          </h2>
          <p className="mt-6 text-lg font-jetbrains-mono text-neutral-500">
            // We build systems, not just pages.
          </p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-2 lg:min-h-[600px] auto-rows-fr">
          <CrossPlatformCard />
          <RealtimeCard />
          <AICard />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
           animation: scan 2s linear infinite;
        }
      `}</style>
    </section>
  );
}