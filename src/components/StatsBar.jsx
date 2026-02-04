"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

function AnimatedNumber({ value, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const springValue = useSpring(0, {
    duration: 2000,
    bounce: 0
  });
  
  const display = useTransform(springValue, (current) => 
    `${prefix}${Math.round(current).toLocaleString()}${suffix}`
  );
  
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, springValue, hasAnimated]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [display]);

  return (
    <span ref={ref} className="tabular-nums tracking-tight">
      {displayValue}
    </span>
  );
}

const stats = [
  {
    value: 50,
    suffix: "+",
    label: "Projects Delivered",
    description: "Across 4 continents",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    )
  },
  {
    value: 98,
    suffix: "%",
    label: "Client Retention",
    description: "Long-term partnerships",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M16.7 13.5l-4.3-4.3-4.3 4.3M12 3v13.5M20.4 16.2c.2.7.3 1.4.3 2.1 0 4.4-3.6 8-8 8s-8-3.6-8-8c0-.7.1-1.4.3-2.1" />
      </svg>
    )
  },
  {
    value: 12,
    suffix: "ms",
    label: "Avg. Response",
    description: "Real-time systems",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    value: 4.9,
    suffix: "/5",
    label: "Client Rating",
    description: "Based on 40+ reviews",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  }
];

function StatCard({ stat, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="relative p-6 sm:p-8 lg:p-10 bg-neutral-50/50 hover:bg-white border border-transparent hover:border-neutral-200 transition-all duration-500">
        {/* Corner Accents on Hover */}
        <motion.span 
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neutral-400"
        />
        <motion.span 
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-400"
        />
        <motion.span 
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-400"
        />
        <motion.span 
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neutral-400"
        />

        {/* Icon */}
        <motion.div 
          animate={{ 
            rotate: isHovered ? 360 : 0,
            color: isHovered ? "#171717" : "#9ca3af"
          }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-neutral-400"
        >
          {stat.icon}
        </motion.div>

        {/* Value */}
        <div className="relative overflow-hidden">
          <h3 className="font-space-grotesk text-4xl sm:text-5xl lg:text-6xl font-medium text-neutral-900 tracking-tight">
            <AnimatedNumber 
              value={stat.value} 
              suffix={stat.suffix}
            />
          </h3>
          {/* Underline Animation */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + (index * 0.1), duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="h-0.5 bg-gradient-to-r from-neutral-400 to-transparent mt-2 origin-left"
          />
        </div>

        {/* Label */}
        <p className="mt-3 font-jetbrains-mono text-xs sm:text-sm uppercase tracking-widest text-neutral-500">
          {stat.label}
        </p>
        
        {/* Description */}
        <motion.p 
          animate={{ opacity: isHovered ? 1 : 0.6, y: isHovered ? 0 : 5 }}
          className="mt-2 text-sm text-neutral-400 font-light"
        >
          {stat.description}
        </motion.p>

        {/* Background Number */}
        <span className="absolute -bottom-4 -right-4 font-space-grotesk text-[120px] font-bold text-neutral-100 leading-none select-none pointer-events-none">
          {index + 1}
        </span>
      </div>

      {/* Connection Line (except last) */}
      {index < stats.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-neutral-200" />
      )}
    </motion.div>
  );
}

export default function StatsBar() {
  return (
    <section className="relative py-20 sm:py-24 lg:py-32 bg-white overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `radial-gradient(circle, #171717 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-16 sm:mb-20"
        >
          <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
            By The Numbers
          </span>
          <h2 className="mt-3 font-space-grotesk text-3xl sm:text-4xl font-medium text-neutral-900 tracking-tight">
            Impact that speaks for itself
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        {/* Bottom Decoration */}
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="mt-16 sm:mt-20 h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent"
        />
      </div>
    </section>
  );
}