// src/components/Testimonial.jsx
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { CornerFrame } from "@/components/CornerFrame";
import GridBackground from "@/components/GridBackground"; // 1. Import this


const testimonials = [
  {
    id: 1,
    quote: "They didn't just build our platform—they redefined how we think about digital products. The attention to architectural detail is unmatched.",
    author: "Debra Fiscal",
    role: "CEO",
    company: "Family Fund",
    image: "/images/testimonials/debra.jpg",
    metric: "2.4x",
    metricLabel: "Growth",
    color: "blue"
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
    color: "emerald"
  },
  {
    id: 3,
    quote: "The engineering excellence they delivered transformed our entire digital infrastructure. Every interaction felt like a true partnership.",
    author: "Sarah Mitchell",
    role: "VP Engineering",
    company: "Bright Path",
    image: "/images/testimonials/sarah.jpg",
    metric: "10x",
    metricLabel: "Speed",
    color: "purple"
  }
];

const colorSchemes = {
  blue: { bg: "bg-blue-500", text: "text-blue-600", bgLight: "bg-blue-50", border: "border-blue-200", gradient: "from-blue-500/10" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", bgLight: "bg-emerald-50", border: "border-emerald-200", gradient: "from-emerald-500/10" },
  purple: { bg: "bg-purple-500", text: "text-purple-600", bgLight: "bg-purple-50", border: "border-purple-200", gradient: "from-purple-500/10" }
};

// Swipe detection hook for mobile
function useSwipe(onSwipeLeft, onSwipeRight, threshold = 50) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe) onSwipeLeft();
    if (isRightSwipe) onSwipeRight();
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
}

function ProgressBar({ isActive, duration, onComplete }) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    let startTime = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isActive, duration, onComplete]);

  return (
    <div className="h-1 bg-neutral-200 overflow-hidden">
      <motion.div 
        className="h-full bg-neutral-900"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);
  
  const AUTO_PLAY_DURATION = 6000;
  const activeTestimonial = testimonials[activeIndex];
  const colors = colorSchemes[activeTestimonial.color];

  // Navigation handlers
  const goToNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const goToSlide = (index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsAutoPlaying(false);
  };

  // Swipe handlers for mobile
  const swipeHandlers = useSwipe(goToNext, goToPrev, 50);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(goToNext, AUTO_PLAY_DURATION);
    return () => clearInterval(timer);
  }, [isAutoPlaying, goToNext]);

  // Pause on visibility change (accessibility)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAutoPlaying(!document.hidden);
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
        setIsAutoPlaying(false);
      } else if (e.key === "ArrowRight") {
        goToNext();
        setIsAutoPlaying(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1]
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1]
      }
    })
  };

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
           <GridBackground opacity={0.05} size={40} />


      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-2">
            <div className="h-px w-4 bg-neutral-300" />
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
              Client Stories
            </span>
          </div>
          
          {/* Auto-play indicator - Desktop only */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-jetbrains-mono text-neutral-400">
            <motion.span
              animate={{ opacity: isAutoPlaying ? [1, 0.5, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-emerald-500' : 'bg-neutral-300'}`}
            />
            {isAutoPlaying ? 'Auto-playing' : 'Paused'}
          </div>
        </motion.div>

        {/* Main Testimonial Card - Mobile First Layout */}
        <div 
          ref={containerRef}
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          {...swipeHandlers}
        >
          <CornerFrame 
            className="bg-white border-neutral-200 overflow-hidden shadow-lg"
            bracketClassName="w-4 h-4 sm:w-5 sm:h-5 border-neutral-300"
          >
            {/* Progress Bar - Top */}
            <div className="absolute top-0 left-0 right-0 z-20">
              <ProgressBar 
                isActive={isAutoPlaying} 
                duration={AUTO_PLAY_DURATION}
                onComplete={goToNext}
              />
            </div>

            <div className="relative min-h-[400px] sm:min-h-[320px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0"
                >
                  {/* Mobile: Stacked Layout | Desktop: Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                    
                    {/* Image Section - Full width on mobile, 5 cols on desktop */}
                    <div className={`relative lg:col-span-5 ${colors.bgLight} p-6 sm:p-8 lg:p-10 flex flex-col justify-center`}>
                      {/* Quote Icon - Mobile optimized size */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colors.bg} flex items-center justify-center mb-4 sm:mb-6`}>
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                        </svg>
                      </div>

                      {/* Metric - Prominent on mobile */}
                      <div className="mb-4 sm:mb-6">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`inline-flex flex-col ${colors.bgLight} border ${colors.border} p-3 sm:p-4`}
                        >
                          <span className={`font-space-grotesk text-3xl sm:text-4xl font-medium ${colors.text}`}>
                            {activeTestimonial.metric}
                          </span>
                          <span className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-500 mt-1">
                            {activeTestimonial.metricLabel}
                          </span>
                        </motion.div>
                      </div>

                      {/* Author Info - Mobile optimized */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Avatar - Larger on mobile for touch */}
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-neutral-200 overflow-hidden shrink-0">
                          {activeTestimonial.image ? (
                            <Image
                              src={activeTestimonial.image}
                              alt={activeTestimonial.author}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-300">
                              <span className="font-space-grotesk text-lg font-bold text-neutral-500">
                                {activeTestimonial.author.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="min-w-0">
                          <div className="font-space-grotesk text-base sm:text-lg font-medium text-neutral-900 truncate">
                            {activeTestimonial.author}
                          </div>
                          <div className="text-xs sm:text-sm text-neutral-500 truncate">
                            {activeTestimonial.role}, {activeTestimonial.company}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quote Section - Full width on mobile, 7 cols on desktop */}
                    <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
                      <blockquote className="relative">
                        {/* Large Quote Mark - Hidden on smallest mobile */}
                        <span className={`absolute -top-2 -left-2 sm:-top-4 sm:-left-4 text-4xl sm:text-6xl ${colors.text} opacity-20 font-serif hidden sm:block`}>
                          "
                        </span>
                        
                        <p className="font-space-grotesk text-lg sm:text-xl lg:text-2xl text-neutral-900 leading-relaxed sm:leading-relaxed relative z-10">
                          {activeTestimonial.quote}
                        </p>
                      </blockquote>

                      {/* Mobile-only: Swipe hint */}
                      <div className="mt-6 flex items-center gap-2 text-neutral-400 sm:hidden">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        <span className="text-[10px] font-jetbrains-mono uppercase tracking-wider">
                          Swipe to navigate
                        </span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="border-t border-neutral-100 p-4 sm:p-6 bg-neutral-50/50">
              <div className="flex items-center justify-between gap-4">
                {/* Prev/Next Buttons - Touch optimized (44px min) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      goToPrev();
                      setIsAutoPlaying(false);
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-all active:scale-95 touch-manipulation"
                    aria-label="Previous testimonial"
                    style={{ minWidth: "44px", minHeight: "44px" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => {
                      goToNext();
                      setIsAutoPlaying(false);
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-all active:scale-95 touch-manipulation"
                    aria-label="Next testimonial"
                    style={{ minWidth: "44px", minHeight: "44px" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Dot Indicators - Larger on mobile */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className="relative p-2 touch-manipulation"
                      aria-label={`Go to testimonial ${index + 1}`}
                      aria-current={index === activeIndex ? "true" : "false"}
                      style={{ minWidth: "44px", minHeight: "44px" }}
                    >
                      <div className={`
                        h-2 sm:h-2.5 rounded-full transition-all duration-300 mx-auto
                        ${index === activeIndex 
                          ? 'w-6 sm:w-8 bg-neutral-900' 
                          : 'w-2 sm:w-2.5 bg-neutral-300 hover:bg-neutral-400'
                        }
                      `} />
                      {index === activeIndex && isAutoPlaying && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute inset-0 border-2 border-neutral-900 rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Counter - Hidden on smallest mobile */}
                <div className="hidden sm:block text-xs font-jetbrains-mono text-neutral-400 tabular-nums">
                  <span className="text-neutral-900 font-medium">{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span className="mx-1">/</span>
                  <span>{String(testimonials.length).padStart(2, '0')}</span>
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-400 transition-all touch-manipulation"
                  aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
                  style={{ minWidth: "44px", minHeight: "44px" }}
                >
                  {isAutoPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </CornerFrame>

          {/* Swipe Gesture Overlay - Mobile only visual hint */}
          <div className="absolute inset-0 pointer-events-none sm:hidden">
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-neutral-900/5 to-transparent opacity-0" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-neutral-900/5 to-transparent opacity-0" />
          </div>
        </div>

        {/* Trust Indicators - Mobile optimized grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
        >
          {[
            { value: "50+", label: "Happy Clients", icon: "★" },
            { value: "4.9", label: "Avg. Rating", icon: "☆" },
            { value: "98%", label: "Retention", icon: "◆" },
            { value: "12", label: "Countries", icon: "◎" }
          ].map((stat, i) => (
            <div 
              key={stat.label} 
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-neutral-200"
            >
              <span className="text-lg sm:text-xl text-neutral-300">{stat.icon}</span>
              <div>
                <div className="font-space-grotesk text-lg sm:text-xl font-medium text-neutral-900">
                  {stat.value}
                </div>
                <div className="text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 sm:mt-10 text-center"
        >
          <p className="text-neutral-600 mb-4 text-sm sm:text-base">
            Ready to become our next success story?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-neutral-900 text-white font-jetbrains-mono text-xs sm:text-sm uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors touch-manipulation"
            style={{ minHeight: "44px" }}
          >
            Start Your Project
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}