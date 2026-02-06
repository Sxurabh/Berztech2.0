// src/components/Testimonial.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    metricLabel: "Growth"
  },
  {
    id: 2,
    quote: "Finally, a team that speaks both business and code. They translated our complex requirements into an elegant, scalable solution.",
    author: "Marcus Chen",
    role: "CTO",
    company: "Unseal",
    image: "/images/testimonials/marcus.jpg",
    metric: "99.99%",
    metricLabel: "Uptime"
  },
  {
    id: 3,
    quote: "The engineering excellence they delivered transformed our entire digital infrastructure. Every interaction felt like a true partnership.",
    author: "Sarah Mitchell",
    role: "VP Engineering",
    company: "Bright Path",
    image: "/images/testimonials/sarah.jpg",
    metric: "10x",
    metricLabel: "Speed"
  }
];

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const AUTO_PLAY_DURATION = 5000;

  const nextTestimonial = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextTestimonial, AUTO_PLAY_DURATION);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextTestimonial]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 mb-6 sm:mb-8"
        >
          <div className="h-px w-4 bg-neutral-300" />
          <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
            Client Stories
          </span>
        </motion.div>

        {/* Main Content - Compact Horizontal Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left: Quote Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {/* Quote */}
                <blockquote className="font-space-grotesk text-lg sm:text-xl lg:text-2xl font-medium text-neutral-900 leading-relaxed mb-4">
                  &ldquo;{activeTestimonial.quote}&rdquo;
                </blockquote>

                {/* Author Info - Compact Row */}
                <div className="flex items-center gap-3">
                  <CornerFrame 
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-neutral-200 overflow-hidden shrink-0"
                    bracketClassName="w-2 h-2 border-neutral-300"
                  >
                    <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                      {activeTestimonial.image ? (
                        <Image
                          src={activeTestimonial.image}
                          alt={activeTestimonial.author}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="font-space-grotesk text-lg font-bold text-neutral-400">
                          {activeTestimonial.author.charAt(0)}
                        </span>
                      )}
                    </div>
                  </CornerFrame>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-jetbrains-mono text-sm font-medium text-neutral-900">
                        {activeTestimonial.author}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {activeTestimonial.role}, {activeTestimonial.company}
                      </span>
                    </div>
                    
                    {/* Metric Badge */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-space-grotesk text-lg font-medium text-neutral-900">
                        {activeTestimonial.metric}
                      </span>
                      <span className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-400">
                        {activeTestimonial.metricLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Navigation & Stats */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4">
            {/* Progress Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className="group relative h-6 flex items-center focus:outline-none"
                  aria-label={`Go to testimonial ${index + 1}`}
                >
                  <div className={`
                    h-1 rounded-full transition-all duration-300
                    ${index === activeIndex ? "w-6 bg-neutral-900" : "w-2 bg-neutral-300 group-hover:bg-neutral-400"}
                  `}>
                    {index === activeIndex && isAutoPlaying && (
                      <motion.div
                        key={`progress-${activeIndex}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: AUTO_PLAY_DURATION / 1000, ease: "linear" }}
                        className="absolute inset-0 bg-neutral-400 rounded-full origin-left"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Counter */}
            <span className="text-xs font-jetbrains-mono text-neutral-400 tabular-nums">
              {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Simple Navigation Arrows - Minimal */}
        <div className="mt-6 pt-6 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
                setIsAutoPlaying(false);
              }}
              className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
              aria-label="Previous"
            >
              ←
            </button>
            <button
              onClick={() => {
                setActiveIndex((prev) => (prev + 1) % testimonials.length);
                setIsAutoPlaying(false);
              }}
              className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
              aria-label="Next"
            >
              →
            </button>
          </div>

          <div className="text-[10px] font-jetbrains-mono text-neutral-400 uppercase tracking-wider">
            Trusted by 50+ companies
          </div>
        </div>
      </div>
    </section>
  );
}