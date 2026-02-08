// src/components/StatsBar.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";

function AnimatedNumber({ value, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  // FIXED: Reduced margin to ensure it triggers easily on mobile
  const isInView = useInView(ref, { once: true, margin: "-10px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    
    const duration = 1500;
    const steps = 30;
    const stepDuration = duration / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += 1;
      const progress = current / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOut * parseFloat(value));
      
      setDisplayValue(`${prefix}${currentValue}${suffix}`);
      
      if (current >= steps) {
        setDisplayValue(`${prefix}${value}${suffix}`);
        clearInterval(timer);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [isInView, value, suffix, prefix]);

  return (
    // FIXED: Added inline-block to ensure consistent intersection observation
    <span ref={ref} className="tabular-nums tracking-tight inline-block min-w-[2ch]">
      {displayValue}
    </span>
  );
}

const stats = [
  { value: 50, suffix: "+", label: "Projects", description: "Delivered" },
  { value: 98, suffix: "%", label: "Client", description: "Retention" },
  { value: 12, suffix: "ms", label: "Avg", description: "Response" },
  { value: 7, suffix: "+", label: "Years", description: "Experience" }
];

export default function StatsBar() {
  return (
    <section className="relative py-8 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <CornerFrame
                className="bg-white border-neutral-200 hover:border-neutral-300 transition-colors p-3 sm:p-4"
                bracketClassName="w-3 h-3 border-black"
              >
                <div className="flex items-baseline gap-1">
                  <span className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-400 block">
                    {stat.label}
                  </span>
                  <span className="text-[10px] sm:text-xs text-neutral-500">
                    {stat.description}
                  </span>
                </div>
              </CornerFrame>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}