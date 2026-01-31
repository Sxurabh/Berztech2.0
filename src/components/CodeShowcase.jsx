"use client";
import React, { useEffect, useRef, useState } from "react";

/* ---------------- Mouse Parallax Hook ---------------- */
function useParallax() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      el.style.transform = `rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
    };

    const reset = () => {
      el.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  return ref;
}

/* ---------------- Live Typing Code Window ---------------- */

const lines = [
  "export default function LiveDashboard() {",
  "  const data = useRealtimeData('/analytics');",
  "  return (",
  "    <Grid responsive={true} layout='masonry'>",
  "      <RevenueChart data={data.revenue} />",
  "      <UserActivity users={data.active} />",
  "    </Grid>",
 
];

function CodeWindow() {
  const ref = useParallax();
  const [displayed, setDisplayed] = useState("");
  const fullText = lines.join("\n");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className="relative rounded-xl bg-[#1e1e1e] p-5 font-mono text-xs text-gray-300 shadow-2xl transition-transform duration-200"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Moving light reflection */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(255,255,255,0.08),transparent_60%)] opacity-0 hover:opacity-100 transition-opacity duration-300" />

      <div className="mb-4 flex gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </div>

      <pre className="whitespace-pre-wrap leading-relaxed">
        {displayed}
        <span className="animate-pulse">▍</span>
      </pre>
    </div>
  );
}

/* ---------------- Live Data Preview ---------------- */

function VisualPreview() {
  const ref = useParallax();
  const [bars, setBars] = useState([40, 70, 50, 80, 60]);

  // simulate live changing data
  useEffect(() => {
    const interval = setInterval(() => {
      setBars((b) => b.map(() => 30 + Math.random() * 70));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex h-full min-h-[320px] flex-col justify-center border rounded-xl bg-neutral-100 p-8 shadow-xl transition-transform duration-200"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative mx-auto w-full max-w-[280px] rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
        <div className="border-b p-4 flex justify-between items-center">
          <div className="h-2 w-20 rounded-full bg-neutral-900 animate-pulse" />
          <div className="h-6 w-6 rounded-full bg-blue-100 animate-bounce" />
        </div>

        <div className="p-4 space-y-4">
          <div className="h-24 w-full rounded-xl border border-blue-100 bg-blue-50 p-3">
            <div className="flex items-end gap-1 h-full pb-2">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="w-1/5 rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-700"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between text-xs text-neutral-400">
            <span className="animate-pulse">Live</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Main Section ---------------- */

export default function CodeShowcase() {
  return (
    <section className="mt-24 px-6 sm:mt-32 lg:mt-40">
      <div className="mx-auto max-w-6xl grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight text-neutral-950 sm:text-4xl">
            Modern architectures for <br />
            <span className="text-neutral-400">complex demands.</span>
          </h2>

          <p className="mt-6 text-base text-neutral-600">
            Real-time systems, reactive interfaces, and scalable architectures
            engineered for performance under pressure.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-950">
            {["Next.js / React", "React Native", "Cloud Native"].map((tech) => (
              <span key={tech} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-950" />
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 opacity-40 blur-3xl" />
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CodeWindow />
            <VisualPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
