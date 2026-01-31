"use client";
import React, { useEffect, useRef, useState } from "react";
import { CornerFrame } from "@/components/CornerFrame";
import clsx from "clsx";

/* ---------------- Mouse Parallax Hook ---------------- */
function useParallax(sensitivity = 10) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.innerWidth < 1024) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      el.style.transform = `
        perspective(1000px)
        rotateX(${y * -sensitivity}deg) 
        rotateY(${x * sensitivity}deg)
      `;
    };

    const reset = () => {
      el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, [sensitivity]);

  return ref;
}

/* ---------------- Component 1: The Technical IDE ---------------- */
function CodeWindow() {
  return (
    <div className="relative z-20 w-full">
      <div className="absolute -top-3 left-4 z-30 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-950">
        Source.tsx
      </div>

      <CornerFrame 
        className="bg-neutral-950 text-neutral-600 p-1 shadow-2xl" 
        // CUSTOMIZATION: Overriding the default w-1.5 h-1.5 to be bigger and thicker
        bracketClassName="w-3 h-3 border-2" 
      >
        <div className="relative overflow-hidden bg-neutral-950 p-6 pt-8 ring-1 ring-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

          <div className="absolute right-4 top-4 flex gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
            <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
          </div>

          <div className="relative font-jetbrains-mono text-[10px] leading-5 text-neutral-400 sm:text-xs">
            <div className="flex gap-4">
              <div className="flex select-none flex-col text-right text-neutral-700">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
              </div>
              <div className="flex flex-col">
                <div><span className="text-purple-400">export default</span> <span className="text-blue-400">function</span> <span className="text-yellow-100">LiveMetric</span>() {"{"}</div>
                <div className="pl-4"><span className="text-purple-400">const</span> data = <span className="text-blue-300">useSocket</span>(<span className="text-green-400">'wss://api.stream'</span>);</div>
                <div className="h-5" />
                <div className="pl-4"><span className="text-purple-400">return</span> (</div>
                <div className="pl-8">&lt;<span className="text-yellow-100">Card</span> <span className="text-purple-300">variant</span>="<span className="text-green-400">industrial</span>"&gt;</div>
                <div className="pl-12 bg-white/5 -mx-12 px-12 border-l-2 border-blue-500">
                   &lt;<span className="text-yellow-100">MetricDisplay</span> <span className="text-purple-300">value</span>={"{"}<span className="text-white">data.rpm</span>{"}"} /&gt;
                </div>
                <div className="pl-8">&lt;/<span className="text-yellow-100">Card</span>&gt;</div>
                <div>)</div>
                <div>{"}"}</div>
              </div>
            </div>
          </div>
        </div>
      </CornerFrame>
    </div>
  );
}

/* ---------------- Component 2: The Industrial Monitor ---------------- */
function VisualPreview() {
  const [val, setVal] = useState(84);

  useEffect(() => {
    const i = setInterval(() => setVal(prev => Math.min(99, Math.max(70, prev + (Math.random() - 0.5) * 10))), 800);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="relative z-20 w-full mt-6 sm:mt-0 sm:translate-y-12 sm:-translate-x-8">
      <div className="absolute -top-3 right-4 z-30 bg-neutral-950 border border-neutral-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
        Output.exe
      </div>

      <CornerFrame 
        className="bg-white text-neutral-300 p-1 shadow-2xl"
        // CUSTOMIZATION: Overriding here as well
        bracketClassName="w-3 h-3 border-2"
      >
        <div className="relative overflow-hidden bg-neutral-50 p-6 min-h-[200px] flex flex-col justify-between border border-neutral-100">
          
          <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
            <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-neutral-500">System_Status</span>
            <div className="flex items-center gap-2">
               <span className="h-1.5 w-1.5 bg-green-500 animate-pulse rounded-full" />
               <span className="font-jetbrains-mono text-[9px] font-bold text-neutral-950">ONLINE</span>
            </div>
          </div>

          <div className="py-6 text-center">
             <div className="font-space-grotesk text-6xl font-bold text-neutral-950 tracking-tighter">
                {Math.floor(val)}<span className="text-2xl text-neutral-400">%</span>
             </div>
             <p className="font-jetbrains-mono text-[10px] text-neutral-400 mt-1">CPU_LOAD_OPTIMIZED</p>
          </div>

          <div className="w-full bg-neutral-200 h-1.5">
             <div 
                className="h-full bg-neutral-950 transition-all duration-500 ease-out" 
                style={{ width: `${val}%` }}
             />
          </div>
          <div className="flex justify-between mt-1 font-jetbrains-mono text-[8px] text-neutral-400">
             <span>0%</span>
             <span>THRESHOLD: 90%</span>
          </div>

        </div>
      </CornerFrame>
    </div>
  );
}

/* ---------------- Main Section ---------------- */
export default function CodeShowcase() {
  const containerRef = useParallax(5);

  return (
    <section className="mt-32 px-6 lg:mt-48 overflow-hidden">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Content */}
        <div>
          <h2 className="font-space-grotesk text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
            Precision engineering <br />
            <span className="text-neutral-400">for complex systems.</span>
          </h2>

          <p className="mt-6 text-lg font-light leading-relaxed text-neutral-600 max-w-md">
            We don't just write scripts; we architect scalable ecosystems. 
            Real-time synchronization, heavy-load optimization, and 
            industrial-grade reliability come standard.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 font-jetbrains-mono text-xs text-neutral-950">
            {["[ NEXT.JS ]", "[ TURBOREPO ]", "[ TYPESCRIPT ]", "[ RUST ]"].map((tech) => (
              <span key={tech} className="cursor-default hover:bg-neutral-100 px-2 py-1 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Right: The Machine */}
        <div ref={containerRef} className="relative perspective-[2000px] group pt-10 sm:pt-0">
            
            {/* The Cable (SVG Connector) */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none z-10 visible hidden lg:block" style={{ overflow: 'visible' }}>
               <path 
                  d="M 200 150 C 300 150, 150 250, 300 280" 
                  fill="none" 
                  stroke="#e5e5e5" 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  className="group-hover:stroke-neutral-400 transition-colors duration-500"
               />
               <circle cx="200" cy="150" r="3" fill="#171717" />
               <circle cx="300" cy="280" r="3" fill="#171717" />
            </svg>

            <CodeWindow />
            <VisualPreview />

            {/* Background Grid Accent */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none -z-10" />
        </div>

      </div>
    </section>
  );
}