// src/components/sections/AITransparency.jsx
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
    icon: "⚡"
  },
  {
    id: "security",
    label: "SECURITY",
    title: "Zero Critical Vulns",
    description: "Automated scanning catches issues before production. Security team validates every critical path.",
    metric: "0",
    metricLabel: "Critical Issues",
    icon: "🛡️"
  },
  {
    id: "quality",
    label: "QUALITY",
    title: "4.9x Fewer Bugs",
    description: "Intelligent refactoring and consistency enforcement. Senior architects approve all structural changes.",
    metric: "4.9x",
    metricLabel: "Bug Reduction",
    icon: "✓"
  }
];

const concerns = [
  {
    q: "Will my code train AI models?",
    a: "No. Self-hosted tools, zero data retention. Your code never leaves our infrastructure."
  },
  {
    q: "Is AI-generated code secure?",
    a: "All output passes automated scanning, then manual security review. We treat AI like a junior dev—helpful, never merged blindly."
  },
  {
    q: "Are you cutting costs at my expense?",
    a: "We invest savings into more senior review time. You get speed + quality, not less attention."
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
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className="font-jetbrains-mono text-xs sm:text-sm text-emerald-600">
      {displayText}
      <span className="animate-pulse">_</span>
    </span>
  );
}

export default function AITransparency() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredConcern, setHoveredConcern] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-white overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)`, 
            backgroundSize: '60px 60px' 
          }}
        />
      </div>

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16 sm:mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <CornerFrame className="inline-block px-3 py-1.5 bg-neutral-50 border-neutral-200">
                <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                  Our Stack
                </span>
              </CornerFrame>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-6"
            >
              AI-accelerated.
              <br />
              <span className="text-neutral-400">Human-validated.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-neutral-600 leading-relaxed font-light max-w-md"
            >
              We leverage AI for velocity, never for substitution. 
              Every line is reviewed, every decision architected.
            </motion.p>
          </div>

          {/* Terminal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <CornerFrame className="bg-neutral-50 border-neutral-200" bracketClassName="w-4 h-4 border-neutral-300">
              <div className="p-4 sm:p-6">
                {/* Terminal Header */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                  </div>
                  <span className="ml-3 text-[10px] font-jetbrains-mono text-neutral-400">berztech — ai-policy.md</span>
                </div>

                {/* Terminal Content */}
                <div className="space-y-2 min-h-[140px]">
                  {isVisible && (
                    <>
                      <div className="flex items-center gap-2 text-neutral-400">
                        <span className="text-blue-500">➜</span>
                        <span className="font-jetbrains-mono text-xs">~</span>
                        <span className="font-jetbrains-mono text-xs text-neutral-400">cat transparency.manifest</span>
                      </div>
                      <TerminalLine text="AI_ASSISTED: true" delay={200} />
                      <TerminalLine text="HUMAN_REVIEWED: required" delay={600} />
                      <TerminalLine text="SECURITY_VALIDATED: enforced" delay={1000} />
                      <TerminalLine text="CLIENT_DATA_RETENTION: zero" delay={1400} />
                    </>
                  )}
                </div>
              </div>
            </CornerFrame>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 sm:bottom-4 sm:-right-8"
            >
              <CornerFrame className="px-3 py-2 bg-emerald-50 border-emerald-200 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-jetbrains-mono text-emerald-600 uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              </CornerFrame>
            </motion.div>
          </motion.div>
        </div>

        {/* Interactive Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
          
          {/* Tab Navigation */}
          <div className="lg:col-span-4 space-y-2 sm:space-y-3">
            {capabilities.map((cap, index) => (
              <motion.button
                key={cap.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTab(index)}
                className={`w-full text-left p-4 sm:p-6 border transition-all duration-300 relative group ${
                  activeTab === index 
                    ? 'bg-neutral-50 border-neutral-300' 
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Active Indicator */}
                <motion.div 
                  initial={false}
                  animate={{ scaleY: activeTab === index ? 1 : 0 }}
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 origin-top"
                />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`text-[10px] font-jetbrains-mono uppercase tracking-widest transition-colors ${
                      activeTab === index ? 'text-emerald-600' : 'text-neutral-400'
                    }`}>
                      {cap.label}
                    </span>
                    <h3 className={`font-space-grotesk text-lg sm:text-xl font-medium mt-1 transition-colors ${
                      activeTab === index ? 'text-neutral-900' : 'text-neutral-600 group-hover:text-neutral-700'
                    }`}>
                      {cap.title}
                    </h3>
                  </div>
                  <span className="text-2xl opacity-80">{cap.icon}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Active Content Display */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <CornerFrame className="h-full bg-white border-neutral-200 p-6 sm:p-8 lg:p-10" bracketClassName="w-6 h-6 border-neutral-300">
                  <div className="flex flex-col h-full">
                    {/* Large Metric */}
                    <div className="mb-6">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-space-grotesk text-5xl sm:text-6xl lg:text-7xl font-medium text-neutral-900 tracking-tighter"
                      >
                        {capabilities[activeTab].metric}
                      </motion.div>
                      <div className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-400 mt-2">
                        {capabilities[activeTab].metricLabel}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-light mb-8 flex-grow">
                      {capabilities[activeTab].description}
                    </p>

                    {/* Honesty Badge */}
                    <div className="flex items-start gap-3 pt-6 border-t border-neutral-200">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-emerald-600 text-xs">✓</span>
                      </div>
                      <p className="text-sm text-neutral-500 font-jetbrains-mono leading-relaxed">
                        <span className="text-neutral-700">Honest note:</span> We never ship AI-generated code without senior engineer review. Architecture decisions remain human-owned.
                      </p>
                    </div>
                  </div>
                </CornerFrame>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Concerns Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20 pt-12 sm:pt-16 border-t border-neutral-200"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-4">
              <h3 className="font-space-grotesk text-xl font-medium text-neutral-900 mb-2">
                Radical transparency
              </h3>
              <p className="text-sm text-neutral-500 font-light">
                Questions we ask ourselves. Answered honestly.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-2">
              {concerns.map((concern, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className="border border-neutral-200 hover:border-neutral-300 transition-colors bg-neutral-50"
                    onMouseEnter={() => setHoveredConcern(index)}
                    onMouseLeave={() => setHoveredConcern(null)}
                  >
                    <button
                      onClick={() => setHoveredConcern(hoveredConcern === index ? null : index)}
                      className="w-full p-4 sm:p-6 flex items-center justify-between gap-4 text-left"
                    >
                      <span className="font-jetbrains-mono text-sm text-neutral-900">
                        {concern.q}
                      </span>
                      <motion.div
                        animate={{ rotate: hoveredConcern === index ? 45 : 0 }}
                        className="w-6 h-6 border border-neutral-300 flex items-center justify-center text-neutral-500 shrink-0"
                      >
                        <span className="text-sm">+</span>
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {hoveredConcern === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                            <div className="h-px bg-neutral-200 mb-4" />
                            <p className="text-sm text-neutral-600 leading-relaxed">
                              {concern.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-jetbrains-mono text-neutral-500 uppercase tracking-wider">
              AI Policy: Transparent by default
            </span>
          </div>

          <Link 
            href="/process"
            className="group inline-flex items-center gap-2 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Read full methodology
            <span className="w-6 h-px bg-neutral-300 group-hover:w-8 group-hover:bg-neutral-900 transition-all" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}