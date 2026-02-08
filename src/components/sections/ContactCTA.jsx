"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";
import GridBackground from "@/components/ui/GridBackground";

const quickInfoItems = [
  {
    id: "discovery",
    label: "DISCOVERY",
    title: "Free Strategy Call",
    description: "30-minute session to explore your challenges",
    meta: "No commitment",
    icon: "01",
    color: "blue",
    stat: "30min"
  },
  {
    id: "response",
    label: "RESPONSE",
    title: "24-Hour Reply",
    description: "Direct access to our engineering team",
    meta: "Avg: 4 hours",
    icon: "02",
    color: "emerald",
    stat: "<24h"
  },
  {
    id: "pricing",
    label: "PRICING",
    title: "Transparent Costs",
    description: "Fixed-price contracts, detailed scope",
    meta: "No hidden fees",
    icon: "03",
    color: "amber",
    stat: "Fixed"
  }
];

const colorSchemes = {
  blue: {
    bg: "bg-blue-500",
    bgLight: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    bracket: "border-blue-300",
    glow: "shadow-blue-500/10",
    gradient: "from-blue-500/5"
  },
  emerald: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    bracket: "border-emerald-300",
    glow: "shadow-emerald-500/10",
    gradient: "from-emerald-500/5"
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    bracket: "border-amber-300",
    glow: "shadow-amber-500/10",
    gradient: "from-amber-500/5"
  }
};

function QuickInfoCard({ item, index, isHovered, onHover }) {
  const colors = colorSchemes[item.color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      className="relative"
    >
      <CornerFrame
        className={`
          relative overflow-hidden bg-white border-neutral-200 
          transition-all duration-500 cursor-pointer h-full
          ${isHovered ? `${colors.border} ${colors.glow}` : 'hover:border-neutral-300'}
        `}
        bracketClassName={`
          w-2.5 h-2.5 sm:w-3 sm:h-3 transition-colors duration-300
          ${isHovered ? colors.bracket : 'border-neutral-300'}
        `}
      >
        {/* Background Gradient on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent pointer-events-none`}
            />
          )}
        </AnimatePresence>

        <div className="relative p-3 sm:p-4">
          {/* Top Row: Number + Label + Stat */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`
                font-jetbrains-mono text-[9px] sm:text-[10px] font-bold tracking-wider
                ${isHovered ? colors.text : 'text-neutral-400'}
                transition-colors duration-300
              `}>
                {item.icon}
              </span>
              <span className={`
                text-[8px] sm:text-[9px] font-jetbrains-mono uppercase tracking-[0.15em]
                ${isHovered ? colors.text : 'text-neutral-400'}
                transition-colors duration-300
              `}>
                {item.label}
              </span>
            </div>
            
            {/* Stat Badge */}
            <span className={`
              font-jetbrains-mono text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5
              transition-colors duration-300
              ${isHovered ? `${colors.bgLight} ${colors.text}` : 'bg-neutral-100 text-neutral-500'}
            `}>
              {item.stat}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-space-grotesk text-xs sm:text-sm font-medium text-neutral-900 mb-1 tracking-tight">
            {item.title}
          </h3>

          {/* Description - Hidden on mobile, visible on sm+ */}
          <p className="hidden sm:block text-[11px] text-neutral-600 leading-relaxed mb-2">
            {item.description}
          </p>

          {/* Meta Tag */}
          <div className="flex items-center gap-1.5">
            <span className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-jetbrains-mono uppercase tracking-wider
              border transition-colors duration-300
              ${isHovered 
                ? `${colors.bgLight} ${colors.text} ${colors.border}` 
                : 'bg-neutral-50 text-neutral-500 border-neutral-200'
              }
            `}>
              <span className={`w-0.5 h-0.5 sm:w-1 sm:h-1 ${isHovered ? colors.bg : 'bg-neutral-300'}`} />
              {item.meta}
            </span>
          </div>
        </div>

        {/* Animated Progress Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${colors.bg}`}
        />
      </CornerFrame>
    </motion.div>
  );
}

export default function ContactCTA() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [emailHovered, setEmailHovered] = useState(false);

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 xl:py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015]">
          <GridBackground size={32} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-50/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Main Container */}
        
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Side: Content */}
            <div className="p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center">
              {/* Section Label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 mb-4 sm:mb-6"
              >
                <div className="h-px w-6 sm:w-8 bg-neutral-300" />
                <span className="text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-[0.2em] text-neutral-400">
                  Start Your Project
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-space-grotesk text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-5xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-4 sm:mb-6"
              >
                Let&apos;s build something
                <br />
                <span className="text-neutral-400">extraordinary together</span>
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base lg:text-lg text-neutral-600 leading-relaxed mb-6 sm:mb-8 max-w-lg"
              >
                Book a discovery call. We&apos;ll discuss your challenges, explore solutions, 
                and outline a clear path forward—no commitment required.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
              >
                <Link href="/contact" className="w-full sm:w-auto">
                  <CornerFrame 
                    className="inline-flex w-full sm:w-auto bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 transition-all duration-300 hover:shadow-lg group"
                    bracketClassName="w-2.5 h-2.5 sm:w-3 sm:h-3 border-white/30"
                  >
                    <span className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-5 sm:px-6 py-3 sm:py-3.5 font-jetbrains-mono text-[10px] sm:text-xs uppercase tracking-widest font-semibold w-full sm:w-auto">
                      Schedule a Call
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-block"
                      >
                        →
                      </motion.span>
                    </span>
                  </CornerFrame>
                </Link>

                <Link 
                  href="/work" 
                  className="group inline-flex items-center justify-center sm:justify-start gap-2 text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors py-3 sm:py-0"
                >
                  <span className="w-4 h-px bg-neutral-300 group-hover:w-6 sm:group-hover:w-8 group-hover:bg-neutral-900 transition-all duration-300" />
                  View Our Work
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-neutral-100"
              >
                {[
                  { value: "50+", label: "Projects" },
                  { value: "98%", label: "Retention" },
                  { value: "4.9", label: "Rating" }
                ].map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="font-space-grotesk text-lg sm:text-xl font-medium text-neutral-900">{stat.value}</span>
                    <span className="text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400">{stat.label}</span>
                    {i < 2 && <span className="hidden sm:inline text-neutral-300 mx-1">·</span>}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Side: Quick Info */}
            <div className="relative p-6 sm:p-8 lg:p-10 xl:p-12">
              {/* Decorative corner element */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
              
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative mb-5 sm:mb-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-[0.15em] text-neutral-400 block mb-1">
                      Why Work With Us
                    </span>
                    <span className="font-space-grotesk text-sm sm:text-base font-medium text-neutral-900">
                      The Berztech Advantage
                    </span>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-900 flex items-center justify-center shrink-0">
                    <span className="text-white font-jetbrains-mono text-xs sm:text-sm font-bold">B</span>
                  </div>
                </div>
              </motion.div>

              {/* Info Cards */}
              <div className="relative space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                {quickInfoItems.map((item, index) => (
                  <QuickInfoCard
                    key={item.id}
                    item={item}
                    index={index}
                    isHovered={hoveredIndex === index}
                    onHover={setHoveredIndex}
                  />
                ))}
              </div>

              {/* Email Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative pt-4 sm:pt-5 border-t border-neutral-200"
                onMouseEnter={() => setEmailHovered(true)}
                onMouseLeave={() => setEmailHovered(false)}
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className={`
                    w-1.5 h-1.5 sm:w-2 sm:h-2 mt-1.5 sm:mt-2 shrink-0 transition-colors duration-300
                    ${emailHovered ? 'bg-neutral-900' : 'bg-neutral-400'}
                  `} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
                      <span className="text-neutral-700 font-medium">Prefer email?</span>{' '}
                      <a 
                        href="mailto:hello@berztech.com" 
                        className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors inline-flex items-center gap-1"
                      >
                        hello@berztech.com
                        <motion.span
                          animate={{ x: emailHovered ? 2 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="inline-block"
                        >
                          →
                        </motion.span>
                      </a>
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-neutral-400 mt-1 font-jetbrains-mono">
                      Typical response: 4 hours
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              
            </div>
          </div>
        

        {/* Bottom Note - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <p className="text-[10px] sm:text-xs text-neutral-400 font-jetbrains-mono uppercase tracking-wider">
            Based in India · Working Worldwide · Available Now
          </p>
        </motion.div>
      </div>
    </section>
  );
}