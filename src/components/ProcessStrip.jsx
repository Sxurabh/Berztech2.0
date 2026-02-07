"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";
import GridBackground from "@/components/GridBackground";

const processes = [
  {
    number: "01",
    title: "Discover",
    description: "Deep-dive into your business, users, and technical requirements. We map the territory before building.",
    duration: "2-3 weeks",
    deliverables: ["Technical Audit", "User Research", "Architecture Plan"],
    color: "blue"
  },
  {
    number: "02",
    title: "Define",
    description: "Strategic planning and scope definition. We align on objectives, success metrics, and project roadmap.",
    duration: "1-2 weeks",
    deliverables: ["Project Scope", "Timeline", "Budget", "KPIs"],
    color: "indigo"
  },
  {
    number: "03",
    title: "Design",
    description: "Crafting intuitive interfaces and experiences. Wireframes to high-fidelity prototypes with user validation.",
    duration: "3-4 weeks",
    deliverables: ["Wireframes", "UI Design", "Prototypes", "Design System"],
    color: "purple"
  },
  {
    number: "04",
    title: "Build",
    description: "Agile development with weekly sprints. Transparent progress, constant communication, zero surprises.",
    duration: "8-12 weeks",
    deliverables: ["Working Prototype", "Code Repository", "Documentation"],
    color: "emerald"
  },
  {
    number: "05",
    title: "Deliver",
    description: "Rigorous testing, smooth deployment, and knowledge transfer. We launch and stay for the long haul.",
    duration: "2-4 weeks",
    deliverables: ["Production Release", "Team Training", "Support Handoff"],
    color: "amber"
  },
  {
    number: "06",
    title: "Maintain",
    description: "Ongoing support, monitoring, and iterative improvements. We ensure your product evolves with your business.",
    duration: "Ongoing",
    deliverables: ["24/7 Support", "Performance Monitoring", "Feature Updates"],
    color: "rose"
  }
];

const colorSchemes = {
  blue: {
    bg: "bg-blue-500",
    text: "text-blue-600",
    bgLight: "bg-blue-50",
    border: "border-blue-200",
    glow: "shadow-blue-500/20",
    number: "text-blue-100"
  },
  indigo: {
    bg: "bg-indigo-500",
    text: "text-indigo-600",
    bgLight: "bg-indigo-50",
    border: "border-indigo-200",
    glow: "shadow-indigo-500/20",
    number: "text-indigo-100"
  },
  purple: {
    bg: "bg-purple-500",
    text: "text-purple-600",
    bgLight: "bg-purple-50",
    border: "border-purple-200",
    glow: "shadow-purple-500/20",
    number: "text-purple-100"
  },
  emerald: {
    bg: "bg-emerald-500",
    text: "text-emerald-600",
    bgLight: "bg-emerald-50",
    border: "border-emerald-200",
    glow: "shadow-emerald-500/20",
    number: "text-emerald-100"
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    bgLight: "bg-amber-50",
    border: "border-amber-200",
    glow: "shadow-amber-500/20",
    number: "text-amber-100"
  },
  rose: {
    bg: "bg-rose-500",
    text: "text-rose-600",
    bgLight: "bg-rose-50",
    border: "border-rose-200",
    glow: "shadow-rose-500/20",
    number: "text-rose-100"
  }
};

export default function ProcessStrip() {
  const [activeTab, setActiveTab] = useState(0);
  const activeProcess = processes[activeTab];
  const colors = colorSchemes[activeProcess.color];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
      {/* Grid Background - Consistent with site */}
            <GridBackground opacity={0.05} size={40} />


      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-4 bg-neutral-300" />
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
              How We Work
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-tight leading-tight">
              Process-driven
              <br />
              <span className="text-neutral-400">results guaranteed</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-sm sm:text-right">
              No black boxes. No surprises. Our transparent methodology keeps you in control.
            </p>
          </div>
        </motion.div>

        {/* Horizontal Tab Navigation - 6 Phases Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 6 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {processes.map((process, index) => {
              const processColors = colorSchemes[process.color];
              return (
                <button
                  key={process.number}
                  onClick={() => setActiveTab(index)}
                  className={`
                    relative px-3 py-3 sm:px-4 sm:py-4 border text-left transition-all duration-300
                    ${activeTab === index 
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg' 
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className={`
                      font-space-grotesk text-xl sm:text-2xl font-medium transition-colors
                      ${activeTab === index ? 'text-neutral-600' : processColors.number}
                    `}>
                      {process.number}
                    </span>
                    
                    <div className="flex-1 min-w-0">
                      <span className={`
                        block text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-wider
                        ${activeTab === index ? 'text-neutral-400' : 'text-neutral-400'}
                      `}>
                        Phase
                      </span>
                      <span className={`
                        block text-sm sm:text-base font-medium mt-0.5 truncate
                        ${activeTab === index ? 'text-white' : 'text-neutral-900'}
                      `}>
                        {process.title}
                      </span>
                    </div>
                  </div>

                  <div className={`
                    mt-2 inline-block px-2 py-0.5 text-[9px] font-jetbrains-mono uppercase tracking-wider
                    ${activeTab === index 
                      ? 'bg-neutral-800 text-neutral-300' 
                      : 'bg-neutral-100 text-neutral-500'
                    }
                  `}>
                    {process.duration}
                  </div>

                  {activeTab === index && (
                    <motion.div
                      layoutId="activeProcess"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Active Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
                bracketClassName="w-4 h-4 sm:w-5 sm:h-5 border-neutral-300 group-hover:border-neutral-400 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                  <div className="lg:col-span-7">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`
                        px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider
                        ${colors.bgLight} ${colors.text} border ${colors.border}
                      `}>
                        {activeProcess.duration}
                      </span>
                      <div className="h-px flex-1 bg-neutral-100" />
                    </div>
                    
                    <h3 className="font-space-grotesk text-xl sm:text-2xl font-medium text-neutral-900 tracking-tight mb-3">
                      {activeProcess.title} Phase
                    </h3>
                    
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                      {activeProcess.description}
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    <div className={`
                      p-3 sm:p-4 border h-full
                      ${colors.bgLight} ${colors.border}
                    `}>
                      <span className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-500 block mb-3">
                        Key Deliverables
                      </span>
                      <ul className="space-y-2">
                        {activeProcess.deliverables.map((item, i) => (
                          <motion.li
                            key={item}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.08 }}
                            className="flex items-start gap-2 text-sm text-neutral-700"
                          >
                            <span className={`
                              w-1.5 h-1.5 mt-1.5 shrink-0
                              ${colors.bg}
                            `} />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${colors.bg}`}
                />
              </CornerFrame>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 sm:mt-8 pt-6 border-t border-neutral-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="w-7 h-7 sm:w-8 sm:h-8 bg-neutral-200 border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold text-neutral-500">{i}</span>
                  </motion.div>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-neutral-500">
                <span className="font-medium text-neutral-900">50+</span> projects delivered
              </span>
            </div>

            <Link
              href="/process"
              className="group inline-flex items-center gap-2 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Explore Full Process
              <span className="w-5 h-px bg-neutral-300 group-hover:w-6 group-hover:bg-neutral-900 transition-all" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}