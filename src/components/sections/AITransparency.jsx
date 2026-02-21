// src/components/AITransparency.jsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";

const capabilities = [
  {
    id: "velocity",
    label: "SPEED",
    title: "40% Faster Delivery",
    description: "AI handles boilerplate, tests, and documentation. Engineers focus on architecture and critical decisions.",
    metric: "40%",
    metricLabel: "Time Saved",
    icon: "⚡",
    color: "blue"
  },
  {
    id: "security",
    label: "SECURITY",
    title: "Zero Critical Vulns",
    description: "Automated scanning catches issues before production. Security team validates every critical path.",
    metric: "0",
    metricLabel: "Critical Issues",
    icon: "🛡️",
    color: "emerald"
  },
  {
    id: "quality",
    label: "QUALITY",
    title: "4.9x Fewer Bugs",
    description: "Intelligent refactoring and consistency enforcement. Senior architects approve all structural changes.",
    metric: "4.9x",
    metricLabel: "Bug Reduction",
    icon: "✓",
    color: "purple"
  },
  {
    id: "transparency",
    label: "TRANSPARENCY",
    title: "100% Explainable",
    description: "Every AI suggestion is traceable, documented, and reviewable. Full audit trails for compliance and trust.",
    metric: "100%",
    metricLabel: "Traceable",
    icon: "◉",
    color: "amber"
  },
  {
    id: "scalability",
    label: "SCALE",
    title: "Infinite Scale",
    description: "AI-accelerated infrastructure that grows with your needs. From prototype to enterprise without rewrites.",
    metric: "∞",
    metricLabel: "Growth Ready",
    icon: "◆",
    color: "rose"
  },
  {
    id: "sustainability",
    label: "SUSTAINABILITY",
    title: "Green Coding",
    description: "Optimized algorithms reduce compute costs and carbon footprint. Efficient code that respects resources.",
    metric: "-60%",
    metricLabel: "Carbon Reduced",
    icon: "🌱",
    color: "cyan"
  }
];

function TerminalLine({ text, delay = 0 }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let timeoutId;
    let intervalId;
    timeoutId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        setDisplayText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(intervalId);
        }
      }, 25);
    }, delay);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, delay]);

  return (
    <span className="font-jetbrains-mono text-[10px] sm:text-xs text-emerald-600 block">
      {displayText}
      <span className="animate-pulse">_</span>
    </span>
  );
}

function Terminal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const lines = [
    { text: "AI_ASSISTED: true", delay: 200 },
    { text: "HUMAN_REVIEWED: required", delay: 500 },
    { text: "SECURITY_VALIDATED: enforced", delay: 800 },
    { text: "CLIENT_DATA_RETENTION: zero", delay: 1100 }
  ];

  return (
    <CornerFrame className="bg-neutral-900 border-neutral-800" bracketClassName="w-3 h-3 border-neutral-700">
      <div className="p-3 sm:p-4">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3 pb-2 border-b border-neutral-800">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-neutral-700" />
            <div className="w-2 h-2 rounded-full bg-neutral-700" />
            <div className="w-2 h-2 rounded-full bg-neutral-700" />
          </div>
          <span className="ml-2 text-[9px] font-jetbrains-mono text-neutral-600">ai-policy.md</span>
        </div>

        {/* Terminal Content */}
        <div className="space-y-1 min-h-[80px] sm:min-h-[90px]">
          <div className="flex items-center gap-2 text-neutral-500 mb-2">
            <span className="text-emerald-500">➜</span>
            <span className="font-jetbrains-mono text-[10px] sm:text-xs">~</span>
            <span className="font-jetbrains-mono text-[10px] sm:text-xs text-neutral-500">cat transparency.manifest</span>
          </div>
          {isVisible && lines.map((line, i) => (
            <TerminalLine key={i} text={line.text} delay={line.delay} />
          ))}
        </div>
      </div>
    </CornerFrame>
  );
}

export default function AITransparency() {
  const [activeTab, setActiveTab] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);
  const activeCapability = capabilities[activeTab];

  // FIXED: Added !important prefix (!) to bracket borders to ensure they override default styles
  const colorSchemes = {
    blue: {
      bg: "bg-blue-500",
      text: "text-blue-600",
      bgLight: "bg-blue-50",
      border: "border-blue-200",
      glow: "shadow-blue-500/20",
      frameBg: "bg-blue-50/50",
      frameBorder: "border-blue-200",
      bracket: "!border-blue-400"
    },
    emerald: {
      bg: "bg-emerald-500",
      text: "text-emerald-600",
      bgLight: "bg-emerald-50",
      border: "border-emerald-200",
      glow: "shadow-emerald-500/20",
      frameBg: "bg-emerald-50/50",
      frameBorder: "border-emerald-200",
      bracket: "!border-emerald-400"
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-purple-600",
      bgLight: "bg-purple-50",
      border: "border-purple-200",
      glow: "shadow-purple-500/20",
      frameBg: "bg-purple-50/50",
      frameBorder: "border-purple-200",
      bracket: "!border-purple-400"
    },
    amber: {
      bg: "bg-amber-500",
      text: "text-amber-600",
      bgLight: "bg-amber-50",
      border: "border-amber-200",
      glow: "shadow-amber-500/20",
      frameBg: "bg-amber-50/50",
      frameBorder: "border-amber-200",
      bracket: "!border-amber-400"
    },
    rose: {
      bg: "bg-rose-500",
      text: "text-rose-600",
      bgLight: "bg-rose-50",
      border: "border-rose-200",
      glow: "shadow-rose-500/20",
      frameBg: "bg-rose-50/50",
      frameBorder: "border-rose-200",
      bracket: "!border-rose-400"
    },
    cyan: {
      bg: "bg-cyan-500",
      text: "text-cyan-600",
      bgLight: "bg-cyan-50",
      border: "border-cyan-200",
      glow: "shadow-cyan-500/20",
      frameBg: "bg-cyan-50/50",
      frameBorder: "border-cyan-200",
      bracket: "!border-cyan-400"
    }
  };

  const colors = colorSchemes[activeCapability.color];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header + Terminal Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-10">
          {/* Left: Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-4 bg-neutral-300" />
              <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                Our Stack
              </span>
            </div>

            <h2 className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-tight leading-tight mb-3">
              AI-accelerated.
              <br />
              <span className="text-neutral-400">Human-validated.</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-md">
              We leverage AI for velocity, never for substitution. Every line is reviewed, every decision architected.
            </p>
          </motion.div>

          {/* Right: Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:mt-0"
          >
            <Terminal />
          </motion.div>
        </div>

        {/* Tab Navigation - 6 Cards Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {capabilities.map((cap, index) => (
              <button
                key={cap.id}
                onClick={() => {
                  if (isSwitching || activeTab === index) return;
                  setIsSwitching(true);
                  setActiveTab(index);
                }}
                className={`
                  relative px-3 py-3 sm:py-3.5 border text-left transition-all duration-300 w-full
                  ${activeTab === index
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }
                `}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">{cap.icon}</span>
                    <span className={`
                      text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-wider
                      ${activeTab === index ? 'text-neutral-400' : 'text-neutral-400'}
                    `}>
                      {cap.label}
                    </span>
                  </div>
                  <span className={`
                    block text-xs sm:text-sm font-medium leading-tight
                    ${activeTab === index ? 'text-white' : 'text-neutral-900'}
                  `}>
                    {cap.title.split(' ')[0]}
                    <span className="hidden sm:inline"> {cap.title.split(' ').slice(1).join(' ')}</span>
                  </span>
                </div>

                {/* Active Indicator */}
                {activeTab === index && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Active Content - DYNAMIC CORNER FRAME COLOR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence mode="wait" onExitComplete={() => setIsSwitching(false)}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* DYNAMIC CORNER FRAME - Changes color based on active tab */}
              <CornerFrame
                className={`
                  ${colors.frameBg} ${colors.frameBorder} ${colors.glow}
                  p-4 sm:p-5 lg:p-6 transition-all duration-500
                `}
                bracketClassName={`w-4 h-4 sm:w-5 sm:h-5 ${colors.bracket} transition-all duration-500`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
                  {/* Metric */}
                  <div className="sm:col-span-4 lg:col-span-3">
                    <div className="flex items-baseline gap-2 sm:block">
                      <span className={`
                        font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tighter
                        ${colors.text} transition-colors duration-500
                      `}>
                        {activeCapability.metric}
                      </span>
                      <span className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-400 sm:block sm:mt-1">
                        {activeCapability.metricLabel}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-8 lg:col-span-9">
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                      {activeCapability.description}
                    </p>

                    {/* Honesty Badge - Dynamic color */}
                    <div className="flex items-start gap-2 mt-4 pt-4">
                      <div className={`
                        w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5
                        ${colors.bgLight} ${colors.text} transition-colors duration-500
                      `}>
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        <span className="font-medium text-neutral-700">Honest note:</span> We never ship AI-generated code without senior engineer review. Architecture decisions remain human-owned.
                      </p>
                    </div>
                  </div>
                </div>
              </CornerFrame>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6"
        >
          <div className="flex items-center gap-2">
            <span className={`
              w-2 h-2 rounded-full animate-pulse transition-colors duration-500
              ${colors.bg}
            `} />
            <span className="text-[10px] sm:text-xs font-jetbrains-mono text-neutral-500 uppercase tracking-wider">
              AI Policy: Transparent by default
            </span>
          </div>

          <Link
            href="/process"
            className="group inline-flex items-center gap-2 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Read full methodology.
            <span className="w-5 h-px bg-neutral-300 group-hover:w-6 group-hover:bg-neutral-900 transition-all" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
