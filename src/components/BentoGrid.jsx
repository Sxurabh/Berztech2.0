"use client";
import React, { useEffect, useRef, useState } from "react";

/* ---------------- Parallax Hook ---------------- */
function useParallax(strength = 6) {
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

    const leave = () => (el.style.transform = "rotateX(0deg) rotateY(0deg)");

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);

  return ref;
}

/* ---------------- Bento Card ---------------- */
function BentoCard({ title, subtitle, tag, children, className = "", dark }) {
  const ref = useParallax(5);

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-3xl p-8 transition-transform duration-200 ${
        dark ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-950"
      } ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Cursor Light */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle at var(--x,50%) var(--y,50%), rgba(255,255,255,0.08), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">
            {tag}
          </p>
          <h3 className="font-display text-xl font-medium">{title}</h3>
          <p className={`mt-2 text-sm ${dark ? "text-neutral-400" : "text-neutral-600"}`}>
            {subtitle}
          </p>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Card 1 ---------------- */
function CrossPlatformCard() {
  return (
    <BentoCard
      tag="Architecture"
      title="Unified Cross-Platform Architecture"
      subtitle="One scalable codebase delivering seamless performance across web, mobile, and desktop."
      className="lg:col-span-2 lg:row-span-2 bg-neutral-100"
    >
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/80 to-transparent" />

      <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="animate-floatSlow h-40 w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-md sm:w-1/2">
          <div className="mb-2 h-2 w-16 rounded bg-neutral-200 animate-pulse" />
          <div className="h-2 w-24 rounded bg-neutral-100" />
        </div>

        <div className="animate-floatFast h-56 w-full rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl sm:w-1/2">
          <div className="mb-2 h-2 w-12 rounded bg-neutral-700" />
          <div className="h-2 w-20 rounded bg-neutral-800" />
          <div className="mt-10 text-center text-white font-display text-lg animate-pulse">
            Native Performance
          </div>
        </div>
      </div>
    </BentoCard>
  );
}

/* ---------------- Card 2 ---------------- */
function RealtimeCard() {
  const [pulse, setPulse] = useState(true);
  useEffect(() => {
    const i = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(i);
  }, []);

  return (
    <BentoCard
      tag="Performance"
      title="Real-Time Data Infrastructure"
      subtitle="Instant updates, live dashboards, and event-driven systems built for high-performance applications."
      dark
    >
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between rounded-lg bg-white/10 p-3">
          <span className="text-xs">Live System</span>
          <span className={`h-3 w-3 rounded-full ${pulse ? "bg-green-400" : "bg-green-700"} transition-colors`} />
        </div>

        <div className="h-2 w-full overflow-hidden rounded bg-white/10">
          <div className="h-full w-1/2 animate-dataFlow bg-gradient-to-r from-cyan-400 to-blue-500" />
        </div>
      </div>
    </BentoCard>
  );
}

/* ---------------- Card 3 ---------------- */
function AICard() {
  return (
    <BentoCard
      tag="Intelligence"
      title="AI-Ready Product Engineering"
      subtitle="We integrate AI copilots, automation layers, and intelligent workflows directly into your platform."
      className="border border-neutral-200"
    >
      <div className="relative mt-10 flex items-center justify-center">
        <div className="absolute h-24 w-24 animate-pulse rounded-full bg-purple-200 blur-2xl opacity-40"></div>
        <div className="relative flex gap-6">
          <div className="h-10 w-10 rounded-full bg-blue-100 animate-orbit1"></div>
          <div className="h-10 w-10 rounded-full bg-purple-100 animate-orbit2"></div>
        </div>
      </div>
    </BentoCard>
  );
}

/* ---------------- Main Section ---------------- */
export default function BentoGrid() {
  return (
    <section className="mt-24 px-6 sm:mt-32 lg:mt-40">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
            Engineered for scale. Designed for the future.
          </h2>
          <p className="mt-4 text-sm text-neutral-600">
            We build high-performance digital products powered by modern architecture,
            real-time systems, and AI-driven capabilities — designed to scale with your
            business and adapt to the future of technology.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-2 lg:min-h-[600px]">
          <CrossPlatformCard />
          <RealtimeCard />
          <AICard />
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatSlow {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes floatFast {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        .animate-floatSlow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-floatFast { animation: floatFast 5s ease-in-out infinite; }

        @keyframes dataFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-dataFlow { animation: dataFlow 3s linear infinite; }

        @keyframes orbit1 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(6px,-6px); }
        }
        @keyframes orbit2 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(-6px,6px); }
        }
        .animate-orbit1 { animation: orbit1 4s ease-in-out infinite; }
        .animate-orbit2 { animation: orbit2 5s ease-in-out infinite; }

        @keyframes dataFlowLine {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
.animate-dataFlowLine {
  background-size: 200% 200%;
  animation: dataFlowLine 3s linear infinite;
}
      `
      
      }</style>
    </section>
  );
}
