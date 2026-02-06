// src/components/Testimonial.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { CornerFrame } from "@/components/CornerFrame";

const testimonials = [
  {
    id: 1,
    quote: "They didn't just build our platform—they redefined how we think about digital products. The attention to architectural detail is unmatched.",
    author: "Debra Fiscal",
    role: "CEO",
    company: "Family Fund",
    image: "/images/testimonials/debra.jpg",
    metric: "2.4x",
    metricLabel: "User Growth",
    accent: "blue"
  },
  {
    id: 2,
    quote: "Finally, a team that speaks both business and code. They translated our complex requirements into an elegant, scalable solution.",
    author: "Marcus Chen",
    role: "CTO",
    company: "Unseal",
    image: "/images/testimonials/marcus.jpg",
    metric: "99.99%",
    metricLabel: "Uptime",
    accent: "emerald"
  },
  {
    id: 3,
    quote: "The engineering excellence they delivered transformed our entire digital infrastructure. Every interaction felt like a partnership.",
    author: "Sarah Mitchell",
    role: "VP Engineering",
    company: "Bright Path",
    image: "/images/testimonials/sarah.jpg",
    metric: "10x",
    metricLabel: "Speed Improvement",
    accent: "purple"
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1]
    }
  }
};

const quoteVariants = {
  enter: { opacity: 0, x: 40, filter: "blur(10px)" },
  center: { 
    opacity: 1, 
    x: 0, 
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.23, 1, 0.32, 1]
    }
  },
  exit: { 
    opacity: 0, 
    x: -40, 
    filter: "blur(10px)",
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1]
    }
  }
};

const imageVariants = {
  enter: { opacity: 0, scale: 1.1, filter: "blur(10px)" },
  center: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.23, 1, 0.32, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(10px)",
    transition: {
      duration: 0.4
    }
  }
};

function ProgressBar({ duration, isActive, key }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800 overflow-hidden">
      <motion.div
        key={key}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration, ease: "linear" }}
        className="h-full origin-left bg-white/30"
      />
    </div>
  );
}

function QuoteIcon({ className }) {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M14 24c-3.3 0-6-2.7-6-6s2.7-6 6-6c1.1 0 2.1.3 3 .8C15.6 7.3 11.4 4 6.5 4v-4c8.8 0 16 7.2 16 16v16h-8.5v-8zm24 0c-3.3 0-6-2.7-6-6s2.7-6 6-6c1.1 0 2.1.3 3 .8-.4-5.5-4.6-8.8-9.5-8.8v-4c8.8 0 16 7.2 16 16v16h-8.5v-8z" 
        fill="currentColor"
      />
    </svg>
  );
}

function StarRating({ count = 5, accent }) {
  const accentColors = {
    blue: "text-blue-500/40",
    emerald: "text-emerald-500/40",
    purple: "text-purple-500/40"
  };

  return (
    <div className="flex gap-0.5">
      {[...Array(count)].map((_, i) => (
        <motion.svg
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className={`w-3 h-3 ${accentColors[accent] || "text-neutral-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </motion.svg>
      ))}
    </div>
  );
}

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  
  const AUTO_PLAY_DURATION = 6000;
  
  const activeTestimonial = testimonials[activeIndex];
  
  const handlePrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  }, []);
  
  const handleNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  }, []);
  
  const goToSlide = useCallback((index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsAutoPlaying(false);
  }, [activeIndex]);

  // Auto-advance
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, AUTO_PLAY_DURATION);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, activeIndex]);

  const accentColors = {
    blue: "from-blue-500/20 to-blue-600/5",
    emerald: "from-emerald-500/20 to-emerald-600/5",
    purple: "from-purple-500/20 to-purple-600/5"
  };

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-neutral-950 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, 
            backgroundSize: '60px 60px' 
          }}
        />
      </div>

      {/* Radial Gradient Background */}
      <div className="absolute inset-0 bg-gradient-radial from-neutral-900/50 via-neutral-950 to-neutral-950" />

      {/* Large Decorative Quote Mark */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none overflow-hidden w-full flex justify-center">
        <QuoteIcon className="w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] text-white/[0.02] -translate-y-1/2" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mb-16 sm:mb-20 lg:mb-24"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
            <div className="h-px flex-1 max-w-12 bg-gradient-to-r from-transparent to-neutral-700" />
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-[0.2em] text-neutral-500">
              Client Stories
            </span>
            <div className="h-px flex-1 max-w-12 bg-gradient-to-l from-transparent to-neutral-700" />
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-center font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight"
          >
            Trusted by industry <span className="text-neutral-600">leaders</span>
          </motion.h2>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Quote Content */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="relative min-h-[280px] sm:min-h-[320px] flex flex-col justify-between">
              
              {/* Quote Content */}
              <div className="relative">
                {/* Small Quote Icon */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mb-6"
                >
                  <QuoteIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white/10" />
                </motion.div>

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={quoteVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-6"
                  >
                    {/* Quote Text */}
                    <blockquote className="font-space-grotesk text-xl sm:text-2xl lg:text-3xl font-medium text-white leading-relaxed tracking-tight">
                      {activeTestimonial.quote}
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center gap-4 pt-4">
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 flex items-center justify-center overflow-hidden">
                          <span className="font-space-grotesk text-lg sm:text-xl font-bold text-white">
                            {activeTestimonial.author.charAt(0)}
                          </span>
                        </div>
                        {/* Online Indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-neutral-950" />
                      </div>
                      
                      <div>
                        <div className="font-jetbrains-mono text-sm sm:text-base text-white font-medium">
                          {activeTestimonial.author}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
                          <span>{activeTestimonial.role}</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-700" />
                          <span className="text-neutral-400">{activeTestimonial.company}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="mt-10 sm:mt-12 pt-6 border-t border-neutral-800/50">
                <div className="flex items-center justify-between gap-6">
                  {/* Progress Dots */}
                  <div className="flex items-center gap-3">
                    {testimonials.map((testimonial, index) => (
                      <button
                        key={testimonial.id}
                        onClick={() => goToSlide(index)}
                        className="group relative h-8 flex items-center justify-center focus:outline-none"
                        aria-label={`Go to testimonial ${index + 1}`}
                        aria-current={index === activeIndex ? "true" : "false"}
                      >
                        <div className={`
                          relative h-1 rounded-full overflow-hidden transition-all duration-300
                          ${index === activeIndex ? "w-8 bg-neutral-700" : "w-4 bg-neutral-800 group-hover:bg-neutral-700"}
                        `}>
                          {index === activeIndex && isAutoPlaying && (
                            <motion.div
                              key={`progress-${activeIndex}`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: AUTO_PLAY_DURATION / 1000, ease: "linear" }}
                              className="absolute inset-0 bg-white origin-left"
                            />
                          )}
                          {index === activeIndex && !isAutoPlaying && (
                            <div className="absolute inset-0 bg-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Counter */}
                  <span className="text-xs font-jetbrains-mono text-neutral-600 tabular-nums">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
                  </span>

                  {/* Arrow Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="group w-10 h-10 sm:w-12 sm:h-12 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/10"
                      aria-label="Previous testimonial"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNext}
                      className="group w-10 h-10 sm:w-12 sm:h-12 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/10"
                      aria-label="Next testimonial"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual Card */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className={`
                absolute -inset-4 blur-3xl opacity-20 rounded-3xl transition-all duration-700
                bg-gradient-to-br ${accentColors[activeTestimonial.accent] || accentColors.blue}
              `} />

              <CornerFrame 
                className="relative bg-neutral-900 overflow-hidden"
                bracketClassName="w-5 h-5 sm:w-6 sm:h-6 border-2 border-neutral-700"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      variants={imageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeTestimonial.image}
                        alt={activeTestimonial.author}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        priority
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-80" />
                      
                      {/* Noise Texture */}
                      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Metric Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`metric-${activeIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <div className={`
                          font-space-grotesk text-4xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tighter
                        `}>
                          {activeTestimonial.metric}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
                          <span className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-[0.15em] text-neutral-400">
                            {activeTestimonial.metricLabel}
                          </span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Decorative Corner Accents */}
                  <div className="absolute top-4 right-4 w-12 h-12 border-t border-r border-white/10" />
                  <div className="absolute bottom-32 left-4 w-8 h-8 border-l border-b border-white/10" />
                </div>
              </CornerFrame>

              {/* Company Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-neutral-900 border border-neutral-800 px-4 py-3 flex items-center gap-3 shadow-2xl"
              >
                <StarRating count={5} accent={activeTestimonial.accent} />
                <span className="text-xs font-jetbrains-mono text-neutral-400 uppercase tracking-wider">
                  {activeTestimonial.company}
                </span>
              </motion.div>

              {/* Accent Line */}
              <div className={`
                absolute -left-2 top-1/4 w-1 h-24 rounded-full bg-gradient-to-b
                ${activeTestimonial.accent === 'blue' ? 'from-blue-500 to-blue-500/20' : 
                  activeTestimonial.accent === 'emerald' ? 'from-emerald-500 to-emerald-500/20' :
                  'from-purple-500 to-purple-500/20'}
              `} />
            </motion.div>
          </div>
        </div>

        {/* Bottom Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 sm:mt-24 lg:mt-32 grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-neutral-800/50"
        >
          {[
            { value: "50+", label: "Projects Delivered" },
            { value: "98%", label: "Client Retention" },
            { value: "4.9", label: "Average Rating" },
            { value: "12+", label: "Countries Served" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className="text-center sm:text-left group cursor-default"
            >
              <div className="font-space-grotesk text-2xl sm:text-3xl font-medium text-white group-hover:text-neutral-300 transition-colors">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-600 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}