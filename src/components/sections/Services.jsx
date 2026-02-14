// src/components/Services.jsx
"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";


const services = [
  {
    id: "01",
    title: "Web Development",
    description: "High-performance, SEO-optimized web applications built with Next.js and React.",
    features: ["Next.js & React", "Headless CMS", "API Integration"],
    price: "From $25k",
    timeline: "8-12 weeks",
    color: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    )
  },
  {
    id: "02",
    title: "Mobile Apps",
    description: "Cross-platform applications using React Native. One codebase, native performance.",
    features: ["React Native", "iOS & Android", "Push Notifications"],
    price: "From $35k",
    timeline: "10-14 weeks",
    color: "purple",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    )
  },
  {
    id: "03",
    title: "Brand Strategy",
    description: "Comprehensive brand identity systems that communicate value and differentiate.",
    features: ["Visual Identity", "Brand Guidelines", "Market Research"],
    price: "From $15k",
    timeline: "4-6 weeks",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    )
  },
  {
    id: "04",
    title: "Digital Marketing",
    description: "Data-driven growth strategies. SEO, content, and paid acquisition for ROI.",
    features: ["SEO Optimization", "Content Strategy", "Paid Acquisition"],
    price: "From $8k/mo",
    timeline: "Ongoing",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    )
  }
];

const accentColors = {
  blue: {
    bg: "group-hover:bg-blue-50",
    border: "group-hover:border-blue-500/20",
    text: "text-blue-600",
    line: "bg-blue-500",
    bgLight: "bg-blue-50",
    bracket: "!border-blue-400"
  },
  purple: {
    bg: "group-hover:bg-purple-50",
    border: "group-hover:border-purple-500/20",
    text: "text-purple-600",
    line: "bg-purple-500",
    bgLight: "bg-purple-50",
    bracket: "!border-purple-400"
  },
  emerald: {
    bg: "group-hover:bg-emerald-50",
    border: "group-hover:border-emerald-500/20",
    text: "text-emerald-600",
    line: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    bracket: "!border-emerald-400"
  },
  amber: {
    bg: "group-hover:bg-amber-50",
    border: "group-hover:border-amber-500/20",
    text: "text-amber-600",
    line: "bg-amber-500",
    bgLight: "bg-amber-50",
    bracket: "!border-amber-400"
  }
};

function ServiceCard({ service, index, isExpanded, onToggle }) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = accentColors[service.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <CornerFrame
        className={`
          relative h-full min-h-[120px] sm:min-h-[140px]
          bg-neutral-50 border-neutral-200 
          transition-all duration-500 ease-out cursor-pointer
          ${colors.bg} ${colors.border}
          ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
        `}
        bracketClassName={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${isHovered || isExpanded ? colors.bracket : 'border-neutral-300'}`}
        onClick={() => onToggle(index)}
      >
        <div className="relative h-full p-4 sm:p-5 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: isHovered ? 1.1 : 1, rotate: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  p-2 rounded-lg border border-neutral-200 bg-white text-neutral-400
                  group-hover:border-neutral-300 group-hover:text-neutral-600
                  transition-colors duration-300
                `}
              >
                {service.icon}
              </motion.div>

              <span className="font-jetbrains-mono text-lg font-medium text-neutral-200 group-hover:text-neutral-300 transition-colors">
                {service.id}
              </span>
            </div>

            {/* Expand Indicator */}
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              className="w-6 h-6 border border-neutral-300 flex items-center justify-center text-neutral-400 group-hover:border-neutral-400 group-hover:text-neutral-600 transition-colors"
            >
              <span className="text-sm leading-none">+</span>
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className="font-space-grotesk text-base sm:text-lg font-medium text-neutral-900 tracking-tight group-hover:text-neutral-800 transition-colors">
                {service.title}
              </h3>
              <span className={`
                px-2 py-0.5 rounded text-[9px] font-jetbrains-mono uppercase tracking-wider
                ${colors.bgLight} ${colors.text}
              `}>
                {service.timeline}
              </span>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 group-hover:text-neutral-600 transition-colors">
              {service.description}
            </p>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-neutral-200">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {service.features.map((feature, i) => (
                      <motion.span
                        key={feature}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-2 py-1 text-[9px] font-jetbrains-mono uppercase tracking-wider text-neutral-600 bg-white border border-neutral-200 rounded"
                      >
                        {feature}
                      </motion.span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-jetbrains-mono text-neutral-400 uppercase tracking-wider block">Starting at</span>
                      <span className="font-space-grotesk text-lg font-medium text-neutral-900">{service.price}</span>
                    </div>

                    <Link href="/contact" onClick={(e) => e.stopPropagation()}>
                      <motion.span
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          inline-flex items-center gap-1 px-3 py-2 
                          font-jetbrains-mono text-[10px] uppercase tracking-widest text-white
                          transition-colors
                          ${service.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                            service.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                              service.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
                                'bg-amber-600 hover:bg-amber-700'}
                        `}
                      >
                        Get Quote
                        <span>→</span>
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hover Accent Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered || isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={`absolute bottom-0 left-0 right-0 h-0.5 origin-left ${colors.line}`}
          />
        </div>
      </CornerFrame>
    </motion.div>
  );
}

export default function Services() {
  const [expandedIndex, setExpandedIndex] = useState(-1);

  const toggleCard = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">


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
              What We Do
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-tight leading-tight">
              Services built for<br />
              <span className="text-neutral-400">scale and impact</span>
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xs sm:text-right">
              End-to-end digital capabilities from concept to deployment.
            </p>
          </div>
        </motion.div>

        {/* Services Grid - Compact 2x2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={toggleCard}
            />
          ))}
        </div>

        {/* Minimal Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 sm:mt-10 pt-6 "
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-neutral-200 flex items-center justify-center rounded-lg">
                <span className="text-neutral-400 text-lg">?</span>
              </div>
              <div>
                <div className="text-xs font-medium text-neutral-900">Not sure what you need?</div>
                <div className="text-[10px] text-neutral-500">We&apos;ll help you figure it out</div>
              </div>
            </div>

            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Book Free Consultation
              <span className="w-5 h-px bg-neutral-300 group-hover:w-6 group-hover:bg-neutral-900 transition-all" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
