// src/components/AITransparency.jsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";

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
  }
];

function TerminalLine({ text, delay = 0 }) {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
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
  const activeCapability = capabilities[activeTab];

  const colorSchemes = {
    blue: {
      bg: "bg-blue-500",
      text: "text-blue-600",
      bgLight: "bg-blue-50",
      border: "border-blue-200",
      glow: "shadow-blue-500/20"
    },
    emerald: {
      bg: "bg-emerald-500",
      text: "text-emerald-600",
      bgLight: "bg-emerald-50",
      border: "border-emerald-200",
      glow: "shadow-emerald-500/20"
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-purple-600",
      bgLight: "bg-purple-50",
      border: "border-purple-200",
      glow: "shadow-purple-500/20"
    }
  };

  const colors = colorSchemes[activeCapability.color];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }}
        />
      </div>

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

        {/* Tab Navigation - Horizontal Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {capabilities.map((cap, index) => (
              <button
                key={cap.id}
                onClick={() => setActiveTab(index)}
                className={`
                  relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border text-left transition-all duration-300
                  ${activeTab === index 
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg' 
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }
                `}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-base sm:text-lg">{cap.icon}</span>
                  <div>
                    <span className={`
                      block text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider
                      ${activeTab === index ? 'text-neutral-400' : 'text-neutral-400'}
                    `}>
                      {cap.label}
                    </span>
                    <span className={`
                      block text-xs sm:text-sm font-medium mt-0.5
                      ${activeTab === index ? 'text-white' : 'text-neutral-900'}
                    `}>
                      {cap.title}
                    </span>
                  </div>
                </div>
                
                {/* Active Indicator */}
                {activeTab === index && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-neutral-900 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Active Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CornerFrame 
                className={`
                  bg-white border-neutral-200 p-4 sm:p-5 lg:p-6
                  ${colors.glow}
                `}
                bracketClassName="w-4 h-4 sm:w-5 sm:h-5 border-neutral-300"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
                  {/* Metric */}
                  <div className="sm:col-span-4 lg:col-span-3">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="flex items-baseline gap-2 sm:block"
                    >
                      <span className={`
                        font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tighter
                        ${colors.text}
                      `}>
                        {activeCapability.metric}
                      </span>
                      <span className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-400 sm:block sm:mt-1">
                        {activeCapability.metricLabel}
                      </span>
                    </motion.div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-8 lg:col-span-9">
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                      {activeCapability.description}
                    </p>
                    
                    {/* Honesty Badge */}
                    <div className="flex items-start gap-2 mt-4 pt-4 border-t border-neutral-100">
                      <div className={`
                        w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5
                        ${colors.bgLight} ${colors.text}
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
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-neutral-100"
        >
          <div className="flex items-center gap-2">
            <span className={`
              w-2 h-2 rounded-full animate-pulse
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
            Read full methodology
            <span className="w-5 h-px bg-neutral-300 group-hover:w-6 group-hover:bg-neutral-900 transition-all" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}