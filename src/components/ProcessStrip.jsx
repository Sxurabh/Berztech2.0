"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
    title: "Build",
    description: "Agile development with weekly sprints. Transparent progress, constant communication, zero surprises.",
    duration: "8-12 weeks",
    deliverables: ["Working Prototype", "Code Repository", "Documentation"],
    color: "purple"
  },
  {
    number: "03",
    title: "Deliver",
    description: "Rigorous testing, smooth deployment, and knowledge transfer. We launch and stay for the long haul.",
    duration: "2-4 weeks",
    deliverables: ["Production Release", "Team Training", "Support Handoff"],
    color: "emerald"
  }
];

function ProcessCard({ process, index, isActive, onHover }) {
  const colors = {
    blue: "group-hover:border-blue-500/30 group-hover:bg-blue-50/30",
    purple: "group-hover:border-purple-500/30 group-hover:bg-purple-50/30",
    emerald: "group-hover:border-emerald-500/30 group-hover:bg-emerald-50/30"
  };

  const accentColors = {
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    emerald: "text-emerald-600 bg-emerald-100"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => onHover(index)}
      className={`group relative ${isActive ? 'z-10' : 'z-0'}`}
    >
      <div className={`relative p-6 sm:p-8 border border-neutral-200 bg-white transition-all duration-500 ${colors[process.color]} ${isActive ? 'shadow-2xl shadow-neutral-900/5' : ''}`}>
        {/* Number */}
        <div className="flex items-start justify-between mb-6">
          <span className={`font-space-grotesk text-5xl sm:text-6xl font-medium text-neutral-100 group-hover:text-neutral-200 transition-colors duration-500`}>
            {process.number}
          </span>
          <div className={`px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider ${accentColors[process.color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
            {process.duration}
          </div>
        </div>

        {/* Title with animated underline */}
        <div className="relative mb-4">
          <h3 className="font-space-grotesk text-2xl sm:text-3xl font-medium text-neutral-900 tracking-tight">
            {process.title}
          </h3>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + (index * 0.1), duration: 0.6 }}
            className={`absolute -bottom-2 left-0 h-0.5 w-12 origin-left ${process.color === 'blue' ? 'bg-blue-500' : process.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'}`}
          />
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6 font-light">
          {process.description}
        </p>

        {/* Deliverables */}
        <AnimatePresence>
          {(isActive || true) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {process.deliverables.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-2 text-xs font-jetbrains-mono text-neutral-500"
                >
                  <span className={`w-1 h-1 rounded-full ${process.color === 'blue' ? 'bg-blue-500' : process.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                  {item}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner Accents */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neutral-200 group-hover:border-neutral-400 transition-colors" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neutral-200 group-hover:border-neutral-400 transition-colors" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neutral-200 group-hover:border-neutral-400 transition-colors" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neutral-200 group-hover:border-neutral-400 transition-colors" />

        {/* Connection Line (not on last) */}
        {index < processes.length - 1 && (
          <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-px bg-neutral-200">
            <motion.div 
              animate={{ x: [-12, 12, -12] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${process.color === 'blue' ? 'bg-blue-500' : process.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'}`}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ProcessStrip() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(90deg, #171717 1px, transparent 1px)`,
          backgroundSize: '80px 100%'
        }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
              How We Work
            </span>
            <h2 className="mt-3 font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-[0.95]">
              Process-driven<br />
              <span className="text-neutral-400">results guaranteed</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:flex lg:items-end lg:justify-end"
          >
            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-md font-light lg:text-right">
              No black boxes. No surprises. Our transparent methodology keeps you in control while we handle the complexity.
            </p>
          </motion.div>
        </div>

        {/* Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {processes.map((process, index) => (
            <ProcessCard
              key={process.number}
              process={process}
              index={index}
              isActive={activeIndex === index}
              onHover={setActiveIndex}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 sm:mt-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-neutral-100"
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-500">{i}</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-neutral-500">
              <span className="font-semibold text-neutral-900">50+</span> projects delivered using this process
            </span>
          </div>

          <Link
            href="/process"
            className="group inline-flex items-center gap-3 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            Explore Full Process
            <span className="w-8 h-8 border border-neutral-300 group-hover:border-neutral-900 flex items-center justify-center transition-all duration-300 group-hover:bg-neutral-900 group-hover:text-white">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}