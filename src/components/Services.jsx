"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";

const services = [
  {
    id: "01",
    title: "Web Development",
    description: "High-performance, SEO-optimized web applications built with Next.js, React, and robust backend architectures.",
    features: ["Next.js & React", "Headless CMS", "API Integration", "Performance Optimization"],
    price: "From $25k",
    timeline: "8-12 weeks",
    color: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    )
  },
  {
    id: "02",
    title: "Mobile Apps",
    description: "Cross-platform applications using React Native. One codebase, native performance, scalable architecture.",
    features: ["React Native", "iOS & Android", "Offline Support", "Push Notifications"],
    price: "From $35k",
    timeline: "10-14 weeks",
    color: "purple",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    )
  },
  {
    id: "03",
    title: "Brand Strategy",
    description: "Comprehensive brand identity systems that communicate value and differentiate in crowded markets.",
    features: ["Visual Identity", "Brand Guidelines", "Market Research", "Messaging Framework"],
    price: "From $15k",
    timeline: "4-6 weeks",
    color: "emerald",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    )
  },
  {
    id: "04",
    title: "Digital Marketing",
    description: "Data-driven growth strategies. SEO, content, and paid acquisition engineered for measurable ROI.",
    features: ["SEO Optimization", "Content Strategy", "Paid Acquisition", "Analytics Setup"],
    price: "From $8k/mo",
    timeline: "Ongoing",
    color: "amber",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    )
  }
];

function ServiceCard({ service, index, isExpanded, onToggle }) {
  const colors = {
    blue: "group-hover:border-blue-500/30 group-hover:bg-blue-50/10",
    purple: "group-hover:border-purple-500/30 group-hover:bg-purple-50/10",
    emerald: "group-hover:border-emerald-500/30 group-hover:bg-emerald-50/10",
    amber: "group-hover:border-amber-500/30 group-hover:bg-amber-50/10"
  };

  const accentColors = {
    blue: "text-blue-600 bg-blue-100 border-blue-200",
    purple: "text-purple-600 bg-purple-100 border-purple-200",
    emerald: "text-emerald-600 bg-emerald-100 border-emerald-200",
    amber: "text-amber-600 bg-amber-100 border-amber-200"
  };

  const numberColors = {
    blue: "text-blue-200",
    purple: "text-purple-200",
    emerald: "text-emerald-200",
    amber: "text-amber-200"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      className="group"
    >
      <div 
        onClick={() => onToggle(index)}
        className={`relative cursor-pointer border border-neutral-200 bg-white transition-all duration-500 ${colors[service.color]} ${isExpanded ? 'shadow-2xl shadow-neutral-900/5' : 'hover:shadow-lg'}`}
      >
        {/* Header - Always Visible */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Number */}
              <span className={`font-space-grotesk text-4xl sm:text-5xl font-medium ${numberColors[service.color]} transition-colors duration-300 group-hover:text-neutral-200`}>
                {service.id}
              </span>
              
              <div>
                {/* Icon & Title Row */}
                <div className="flex items-center gap-3 mb-2">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`p-2 border ${accentColors[service.color]}`}
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="font-space-grotesk text-xl sm:text-2xl font-medium text-neutral-900 tracking-tight">
                    {service.title}
                  </h3>
                </div>
                
                {/* Timeline Badge */}
                <span className={`inline-block px-2 py-1 text-[10px] font-jetbrains-mono uppercase tracking-wider ${accentColors[service.color]}`}>
                  {service.timeline}
                </span>
              </div>
            </div>

            {/* Expand Indicator */}
            <motion.div 
              animate={{ rotate: isExpanded ? 45 : 0 }}
              className="w-8 h-8 border border-neutral-300 flex items-center justify-center text-neutral-400 group-hover:border-neutral-400 group-hover:text-neutral-600 transition-colors"
            >
              <span className="text-lg leading-none">+</span>
            </motion.div>
          </div>

          {/* Preview Description */}
          <p className={`mt-4 text-neutral-600 leading-relaxed font-light ${isExpanded ? 'line-clamp-2' : 'line-clamp-2'}`}>
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
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                {/* Divider */}
                <div className="h-px bg-neutral-200 mb-6" />

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {service.features.map((feature, i) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 text-sm text-neutral-600"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${service.color === 'blue' ? 'bg-blue-500' : service.color === 'purple' ? 'bg-purple-500' : service.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {feature}
                    </motion.div>
                  ))}
                </div>

                {/* Price & CTA Row */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div>
                    <span className="text-xs font-jetbrains-mono text-neutral-400 uppercase tracking-wider">Starting at</span>
                    <div className="font-space-grotesk text-2xl font-medium text-neutral-900">
                      {service.price}
                    </div>
                  </div>

                  <Link href="/contact">
                    <motion.span
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 font-jetbrains-mono text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                    >
                      Get Quote
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </motion.span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner Accents */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neutral-200 group-hover:border-neutral-400 transition-colors duration-300" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-200 group-hover:border-neutral-400 transition-colors duration-300" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-200 group-hover:border-neutral-400 transition-colors duration-300" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neutral-200 group-hover:border-neutral-400 transition-colors duration-300" />

        {/* Active Indicator Line */}
        <motion.div 
          initial={{ scaleY: 0 }}
          animate={{ scaleY: isExpanded ? 1 : 0 }}
          className={`absolute left-0 top-0 bottom-0 w-1 origin-top ${service.color === 'blue' ? 'bg-blue-500' : service.color === 'purple' ? 'bg-purple-500' : service.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`}
        />
      </div>
    </motion.div>
  );
}

export default function Services() {
  const [expandedIndex, setExpandedIndex] = useState(0);

  const toggleCard = (index) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
              What We Do
            </span>
            <h2 className="mt-3 font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-[0.95]">
              Services built for<br />
              <span className="text-neutral-400">scale and impact</span>
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
              End-to-end digital capabilities. From initial concept to production deployment and ongoing growth.
            </p>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 sm:mt-20 pt-8 border-t border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-neutral-200 flex items-center justify-center">
              <span className="font-space-grotesk text-xl font-bold text-neutral-400">?</span>
            </div>
            <div>
              <div className="font-jetbrains-mono text-sm text-neutral-900">Not sure what you need?</div>
              <div className="text-xs text-neutral-500">We&apos;ll help you figure it out</div>
            </div>
          </div>

          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            Book Free Consultation
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