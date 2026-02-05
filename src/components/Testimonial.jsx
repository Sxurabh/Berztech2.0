"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CornerFrame } from "@/components/CornerFrame";

const testimonials = [
  {
    quote: "They didn't just build our platform—they redefined how we think about digital products. The attention to architectural detail is unmatched.",
    author: "Debra Fiscal",
    role: "CEO, Family Fund",
    company: "Family Fund",
    image: "/images/testimonials/debra.jpg", // Replace with actual path
    metric: "2.4x",
    metricLabel: "User Growth"
  },
  {
    quote: "Finally, a team that speaks both business and code. They translated our complex requirements into an elegant, scalable solution.",
    author: "Marcus Chen",
    role: "CTO, Unseal",
    company: "Unseal",
    image: "/images/testimonials/marcus.jpg", // Replace with actual path
    metric: "99.99%",
    metricLabel: "Uptime"
  }
];

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-neutral-950 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, 
            backgroundSize: '60px 60px' 
          }}
        />
      </div>

      {/* Large Background Quote */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <span className="font-space-grotesk text-[20rem] sm:text-[30rem] font-bold text-white/[0.02] leading-none">
  &quot;
</span>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left: Quote Content */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-500">
                Client Stories
              </span>
            </motion.div>

            <div className="relative min-h-[200px] sm:min-h-[250px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  {/* Quote */}
                  <blockquote className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-white leading-tight tracking-tight mb-8">
  &quot;{activeTestimonial.quote}&quot;
</blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-neutral-800 flex items-center justify-center">
                      <span className="font-space-grotesk text-lg font-bold text-white">
                        {activeTestimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-jetbrains-mono text-sm text-white font-medium">
                        {activeTestimonial.author}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {activeTestimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="mt-12 flex items-center gap-6">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-12 h-1 transition-all duration-300 ${
                      index === activeIndex ? 'bg-white' : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                  />
                ))}
              </div>
              
              <span className="text-xs font-jetbrains-mono text-neutral-600">
                {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
              </span>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
                    setIsAutoPlaying(false);
                  }}
                  className="w-10 h-10 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    setActiveIndex((prev) => (prev + 1) % testimonials.length);
                    setIsAutoPlaying(false);
                  }}
                  className="w-10 h-10 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Right: Visual Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              <CornerFrame 
                className="relative bg-neutral-900"
                bracketClassName="w-6 h-6 border-2 border-neutral-700"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <Image
                    src={activeTestimonial.image}
                    alt={activeTestimonial.author}
                    fill
                    className="object-cover grayscale opacity-80"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  
                  {/* Metric Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="font-space-grotesk text-4xl sm:text-5xl font-medium text-white tracking-tight">
                          {activeTestimonial.metric}
                        </div>
                        <div className="text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-400 mt-1">
                          {activeTestimonial.metricLabel}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-white/20" />
                </div>
              </CornerFrame>

              {/* Company Logo Placeholder */}
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-jetbrains-mono text-neutral-500 uppercase tracking-widest">
                  {activeTestimonial.company}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}