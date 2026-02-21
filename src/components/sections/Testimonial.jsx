// src/components/Testimonial.jsx
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import { CornerFrame } from "@/components/ui/CornerFrame";


import { useQuery } from "@tanstack/react-query";
import { testimonialsApi } from "@/lib/api/client";

// Default empty to prevent map errors before fetch
const defaultTestimonials = [];

function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const data = await testimonialsApi.list();
      // Map DB fields to component fields if needed
      return data.map(t => ({
        id: t.id,
        quote: t.content,
        author: t.client,
        role: t.role,
        company: t.company,
        image: t.image,
        metric: t.metric,
        metricLabel: t.metric_label, // DB uses snake_case likely, frontend uses camelCase
        color: t.color || "blue"
      }));
    },
    staleTime: 60 * 1000 * 5, // 5 minutes cache
  });
}

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

// Disabled horizontal progress bar for a cleaner minimal look, but keeping the component as a shell if needed later
function ProgressBar({ isActive, duration, onComplete }) {
  // We will rely on interval instead of visual progress bar in the minimal design
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [isActive, duration, onComplete]);

  return null;
}

const defaultFallback = {
  id: 0, quote: "", author: "", role: "", company: "", image: "", metric: "", metricLabel: "", color: "blue"
};

export default function Testimonial() {
  const { data: fetchedTestimonials = [], isLoading } = useTestimonials();
  const testimonials = fetchedTestimonials;
  const hasData = testimonials.length > 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.5, margin: "0px" });
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Reset index when data arrives
  useEffect(() => {
    setActiveIndex(0);
  }, [hasData, testimonials.length]);

  const AUTO_PLAY_DURATION = 6000;
  const activeTestimonial = (hasData && testimonials[activeIndex]) || defaultFallback;
  const colors = colorSchemes[activeTestimonial.color] || colorSchemes.blue;
  const shouldPlay = isAutoPlaying && isInView && isPageVisible && hasData && !isLoading;

  // Navigation handlers
  const goToNext = useCallback(() => {
    if (!hasData) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [hasData, testimonials.length]);

  const goToPrev = useCallback(() => {
    if (!hasData) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [hasData, testimonials.length]);

  const goToSlide = (index) => {
    if (!hasData) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setIsAutoPlaying(false);
  };

  // Swipe handlers for mobile
  const swipeHandlers = useSwipe(goToNext, goToPrev, 50);



  // Auto-play logic
  useEffect(() => {
    if (!shouldPlay) return;
    const timer = setInterval(goToNext, AUTO_PLAY_DURATION);
    return () => clearInterval(timer);
  }, [shouldPlay, goToNext]);

  // Pause on visibility change (accessibility)
  useEffect(() => {
    if (!shouldPlay) return;
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [shouldPlay]);

  useEffect(() => {
    setIsPageVisible(typeof document !== "undefined" ? !document.hidden : true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!shouldPlay) return;
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
  }, [shouldPlay, goToNext, goToPrev]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-pulse bg-neutral-100 h-96 w-full max-w-5xl rounded-lg" />
      </div>
    );
  }

  if (!hasData) return null;

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">


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
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
              Client Stories
            </span>
          </div>

          {/* Auto-play indicator - Desktop only */}
          <div className="hidden sm:flex items-center gap-2 text-[10px] font-jetbrains-mono text-neutral-600">
            <motion.span
              animate={{ opacity: isAutoPlaying ? [1, 0.5, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-emerald-500' : 'bg-neutral-300'}`}
            />
            {isAutoPlaying ? 'Auto-playing' : 'Paused'}
          </div>
        </motion.div>

        {/* Main Testimonial Card - Minimal Elegant Layout */}
        <div
          ref={containerRef}
          className="relative group"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          {...swipeHandlers}
        >
          <CornerFrame
            className="bg-white border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500 rounded-sm"
            bracketClassName="w-4 h-4 sm:w-5 sm:h-5 border-neutral-300 pointer-events-none"
          >
            {/* Logic-only Progress Bar */}
            <ProgressBar
              isActive={shouldPlay}
              duration={AUTO_PLAY_DURATION}
              onComplete={goToNext}
            />

            <div className="relative min-h-[480px] sm:min-h-[400px] flex flex-col justify-center px-6 py-12 sm:px-12 sm:py-16 lg:px-20 lg:py-24">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col items-center text-center w-full max-w-3xl mx-auto"
                >
                  {/* Subtle Metric Badge (Optional) */}
                  {activeTestimonial.metric && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`mb-8 px-4 py-1.5 rounded-full inline-flex items-center gap-2 border ${colors.border} ${colors.bgLight}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.bg}`} />
                      <span className={`font-space-grotesk text-sm font-medium ${colors.text}`}>
                        {activeTestimonial.metric} {activeTestimonial.metricLabel}
                      </span>
                    </motion.div>
                  )}

                  {/* Elegant Quote Area */}
                  <blockquote className="relative mb-10 w-full">
                    <span className="absolute -top-6 -left-2 sm:-top-8 sm:-left-6 text-6xl sm:text-8xl text-neutral-100 font-serif leading-none select-none -z-10">
                      "
                    </span>
                    <p className="font-space-grotesk text-xl sm:text-2xl lg:text-3xl font-medium text-neutral-900 leading-snug tracking-tight">
                      {activeTestimonial.quote}
                    </p>
                    <span className="absolute -bottom-10 -right-2 sm:-bottom-12 sm:-right-6 text-6xl sm:text-8xl text-neutral-100 font-serif leading-none select-none -z-10 rotate-180">
                      "
                    </span>
                  </blockquote>

                  {/* Author Block */}
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border border-neutral-200">
                      {activeTestimonial.image ? (
                        <Image
                          src={activeTestimonial.image}
                          alt={activeTestimonial.author}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-100">
                          <span className="font-space-grotesk text-lg font-medium text-neutral-500">
                            {activeTestimonial.author.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <div className="font-space-grotesk text-base sm:text-lg font-medium text-neutral-900">
                        {activeTestimonial.author}
                      </div>
                      <div className="text-xs sm:text-sm font-jetbrains-mono text-neutral-500">
                        {activeTestimonial.role}, <span className="text-neutral-900">{activeTestimonial.company}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Minimal Nav Controls - Hover Reveal on Desktop, Visible on Mobile */}
            <div className="absolute inset-y-0 left-0 flex items-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => { goToPrev(); setIsAutoPlaying(false); }}
                className="w-12 h-12 pl-4 pr-2 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none touch-manipulation"
                aria-label="Previous testimonial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => { goToNext(); setIsAutoPlaying(false); }}
                className="w-12 h-12 pr-4 pl-2 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none touch-manipulation"
                aria-label="Next testimonial"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Pagination Dots - Positioned gracefully at the bottom */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 z-20">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="p-2 touch-manipulation group/dot"
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : "false"}
                >
                  <div className={`
                    h-1.5 rounded-full transition-all duration-300
                    ${index === activeIndex
                      ? 'w-6 bg-neutral-900'
                      : 'w-1.5 bg-neutral-300 group-hover/dot:bg-neutral-400'
                    }
                  `} />
                </button>
              ))}
            </div>

          </CornerFrame>
        </div>

        {/* Trust Indicators - Minimal Elegant Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
        >
          {[
            { value: "50+", label: "Happy Clients" },
            { value: "4.9", label: "Avg. Rating" },
            { value: "98%", label: "Retention" },
            { value: "12", label: "Countries" }
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex items-baseline gap-1.5 sm:gap-2 border-b border-transparent hover:border-neutral-200 transition-colors pb-1"
            >
              <div className="font-space-grotesk text-xl sm:text-2xl font-medium text-neutral-900">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs font-jetbrains-mono uppercase tracking-wider text-neutral-500">
                {stat.label}
              </div>
              {i < 3 && <div className="hidden sm:block ml-6 text-neutral-200 select-none">/</div>}
            </div>
          ))}
        </motion.div>

        {/* CTA - Mobile optimized */}

      </div>
    </section>
  );
}
