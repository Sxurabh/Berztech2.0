// src/components/BentoGrid.jsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";

// Platform Icons Component
function PlatformIcons({ isHovered }) {
  const platforms = [
    {
      name: "iOS",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ),
      delay: 0
    },
    {
      name: "Android",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
          <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
        </svg>
      ),
      delay: 0.1
    },
    {
      name: "Web",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
      ),
      delay: 0.2
    },
    {
      name: "Desktop",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 sm:w-5 sm:h-5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
      ),
      delay: 0.3
    }
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {platforms.map((platform, index) => (
        <motion.div
          key={platform.name}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { delay: platform.delay, duration: 0.4 }
          }}
          whileHover={{ 
            scale: 1.2, 
            y: -2,
            transition: { duration: 0.2 }
          }}
          className={`
            relative p-2 sm:p-2.5 rounded-xl border border-neutral-200 
            bg-white text-neutral-400 cursor-default
            transition-colors duration-300
            ${isHovered ? 'border-neutral-300 text-neutral-600 shadow-sm' : ''}
          `}
        >
          {platform.icon}
          {/* Tooltip */}
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400 whitespace-nowrap pointer-events-none"
          >
            {platform.name}
          </motion.span>
          {/* Connection dot */}
          {index < platforms.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              className="absolute -right-3 sm:-right-4 top-1/2 w-2 sm:w-3 h-px bg-neutral-300 origin-left hidden sm:block"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Code Preview Component for Unified Card
function CodePreview({ isHovered }) {
  const codeLines = [
    { text: "export default function App() {", indent: 0, color: "text-neutral-400" },
    { text: "return (", indent: 1, color: "text-neutral-400" },
    { text: "<View>", indent: 2, color: "text-blue-400" },
    { text: "<Component />", indent: 3, color: "text-emerald-400" },
    { text: "</View>", indent: 2, color: "text-blue-400" },
    { text: ");", indent: 1, color: "text-neutral-400" },
    { text: "}", indent: 0, color: "text-neutral-400" },
  ];

  return (
    <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-neutral-900/5 border border-neutral-200/50 font-jetbrains-mono text-[9px] sm:text-[10px] leading-relaxed overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2 opacity-50">
        <div className="w-2 h-2 rounded-full bg-neutral-300" />
        <div className="w-2 h-2 rounded-full bg-neutral-300" />
        <div className="w-2 h-2 rounded-full bg-neutral-300" />
      </div>
      <div className="space-y-0.5">
        {codeLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ 
              opacity: isHovered ? 1 : 0.6, 
              x: 0,
              transition: { delay: i * 0.05 }
            }}
            className={`${line.color} pl-${line.indent * 2}`}
            style={{ paddingLeft: `${line.indent * 8}px` }}
          >
            {line.text}
          </motion.div>
        ))}
      </div>
      {/* Typewriter cursor */}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-1.5 h-3.5 bg-emerald-500 ml-0.5 align-middle"
      />
    </div>
  );
}

const features = [
  {
    id: 1,
    title: "Unified Codebase",
    description: "Single source of truth for web, mobile, and desktop. React Native + Next.js working in harmony.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 sm:w-5 sm:h-5">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    metric: "70%",
    metricLabel: "Code Reuse",
    accent: "blue",
    size: "large",
    hasPlatformIcons: true,
    hasCodePreview: true
  },
  {
    id: 2,
    title: "Performance",
    description: "Sub-100ms interactions through intelligent caching and edge deployment.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 sm:w-5 sm:h-5">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    metric: "<100ms",
    metricLabel: "Response",
    accent: "amber",
    size: "small"
  },
  {
    id: 3,
    title: "Security First",
    description: "SOC 2 Type II compliant infrastructure with automated vulnerability scanning.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 sm:w-5 sm:h-5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    metric: "Zero",
    metricLabel: "Breaches",
    accent: "emerald",
    size: "small"
  },
  {
    id: 4,
    title: "AI-Assisted",
    description: "Leveraging modern AI tools for 40% faster delivery without compromising quality.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 sm:w-5 sm:h-5">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    metric: "40%",
    metricLabel: "Faster",
    accent: "purple",
    size: "small"
  },
  {
    id: 5,
    title: "Always On",
    description: "99.99% uptime SLA with global CDN and automated failover systems across 12 regions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 sm:w-5 sm:h-5">
        <path d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
    metric: "99.99%",
    metricLabel: "Uptime",
    accent: "rose",
    size: "medium"
  },
  
];

const accentColors = {
  blue: {
    bg: "group-hover:bg-blue-500/5",
    border: "group-hover:border-blue-500/20",
    text: "text-blue-500",
    glow: "group-hover:shadow-blue-500/10",
    line: "bg-blue-500"
  },
  amber: {
    bg: "group-hover:bg-amber-500/5",
    border: "group-hover:border-amber-500/20",
    text: "text-amber-500",
    glow: "group-hover:shadow-amber-500/10",
    line: "bg-amber-500"
  },
  emerald: {
    bg: "group-hover:bg-emerald-500/5",
    border: "group-hover:border-emerald-500/20",
    text: "text-emerald-500",
    glow: "group-hover:shadow-emerald-500/10",
    line: "bg-emerald-500"
  },
  purple: {
    bg: "group-hover:bg-purple-500/5",
    border: "group-hover:border-purple-500/20",
    text: "text-purple-500",
    glow: "group-hover:shadow-purple-500/10",
    line: "bg-purple-500"
  },
  rose: {
    bg: "group-hover:bg-rose-500/5",
    border: "group-hover:border-rose-500/20",
    text: "text-rose-500",
    glow: "group-hover:shadow-rose-500/10",
    line: "bg-rose-500"
  },
  cyan: {
    bg: "group-hover:bg-cyan-500/5",
    border: "group-hover:border-cyan-500/20",
    text: "text-cyan-500",
    glow: "group-hover:shadow-cyan-500/10",
    line: "bg-cyan-500"
  }
};

function BentoCard({ feature, index }) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = accentColors[feature.accent];
  
  const isLarge = feature.size === "large";
  const isMedium = feature.size === "medium";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.23, 1, 0.32, 1]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative h-full
        ${isLarge ? "col-span-1 md:col-span-2 lg:col-span-2 row-span-2" : ""}
        ${isMedium ? "col-span-1 md:col-span-2" : "col-span-1"}
      `}
    >
      <CornerFrame
        className={`
          relative h-full min-h-[140px] sm:min-h-[160px] 
          ${isLarge ? "lg:min-h-[340px]" : "lg:min-h-[160px]"}
          bg-neutral-50 border-neutral-200 
          transition-all duration-500 ease-out
          ${colors.bg} ${colors.border} ${colors.glow}
          ${isHovered ? "shadow-xl" : "shadow-sm"}
        `}
        bracketClassName="w-3 h-3 sm:w-4 sm:h-4 border-neutral-300 group-hover:border-neutral-400 transition-colors duration-300"
      >
        <div className={`
          relative h-full flex flex-col
          ${isLarge ? "p-4 sm:p-5 lg:p-6" : "p-4 sm:p-5"}
        `}>
          {/* Header Row */}
          <div className={`
            flex items-start justify-between mb-2 sm:mb-3
            ${isLarge ? "lg:mb-4" : ""}
          `}>
            <motion.div
              animate={{ 
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0
              }}
              transition={{ duration: 0.3 }}
              className={`
                p-2 sm:p-2.5 rounded-lg border border-neutral-200 
                bg-white text-neutral-400
                group-hover:border-neutral-300 group-hover:text-neutral-600
                transition-colors duration-300
                ${isLarge ? "lg:p-3" : ""}
              `}
            >
              {feature.icon}
            </motion.div>
            
            {/* Metric Badge */}
            <div className="text-right">
              <motion.div
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
                className={`
                  font-space-grotesk text-xl sm:text-2xl font-medium 
                  text-neutral-900 tracking-tight
                  ${isLarge ? "lg:text-3xl" : ""}
                `}
              >
                {feature.metric}
              </motion.div>
              <div className="text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400">
                {feature.metricLabel}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <h3 className={`
              font-space-grotesk font-medium text-neutral-900 tracking-tight mb-1 sm:mb-2
              group-hover:text-neutral-800 transition-colors
              ${isLarge ? "text-xl sm:text-2xl lg:text-2xl" : "text-lg sm:text-xl"}
            `}>
              {feature.title}
            </h3>
            <p className={`
              text-neutral-500 leading-relaxed
              group-hover:text-neutral-600 transition-colors
              ${isLarge ? "text-sm lg:text-sm line-clamp-3 lg:line-clamp-4" : "text-xs sm:text-sm line-clamp-2 sm:line-clamp-3"}
            `}>
              {feature.description}
            </p>

            {/* Special Content for Large Card */}
            {isLarge && feature.hasPlatformIcons && (
              <div className="mt-auto pt-4 sm:pt-5">
                <div className="mb-2 sm:mb-3">
                  <span className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400">
                    Write Once, Run Everywhere
                  </span>
                </div>
                <PlatformIcons isHovered={isHovered} />
                {feature.hasCodePreview && (
                  <CodePreview isHovered={isHovered} />
                )}
              </div>
            )}
          </div>

          {/* Hover Accent Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${colors.line}`}
          />

          {/* Corner Accent Animation */}
          <motion.div
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.8
            }}
            transition={{ duration: 0.2 }}
            className={`
              absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100
              bg-gradient-to-bl from-neutral-100 to-transparent
              pointer-events-none
            `}
          />
        </div>
      </CornerFrame>
    </motion.div>
  );
}

export default function BentoGrid() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{ 
            backgroundImage: `radial-gradient(circle, #171717 1px, transparent 1px)`, 
            backgroundSize: '24px 24px' 
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 sm:mb-12 lg:mb-14"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-neutral-300" />
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
              Why Choose Us
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="
              font-space-grotesk text-2xl sm:text-3xl lg:text-4xl 
              font-medium text-neutral-900 tracking-tight max-w-md
            ">
              Built for <span className="text-neutral-400">scale</span> and <span className="text-neutral-400">speed</span>
            </h2>
            <Link 
              href="/process"
              className="group inline-flex items-center gap-2 text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors shrink-0"
            >
              See our process
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </Link>
          </div>
        </motion.div>

        {/* Bento Grid - Optimized Layout */}
        <div className="
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
          gap-3 sm:gap-4 lg:gap-4
          auto-rows-fr
        ">
          {features.map((feature, index) => (
            <BentoCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 sm:mt-12 lg:mt-14 pt-6 border-t border-neutral-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              {[
                { label: "Active Projects", value: "12" },
                { label: "Team Members", value: "8" },
                { label: "Years Experience", value: "7+" }
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-baseline gap-1.5">
                  <span className="font-space-grotesk text-lg sm:text-xl font-medium text-neutral-900">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-400">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-jetbrains-mono text-neutral-400">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Available for new projects
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}