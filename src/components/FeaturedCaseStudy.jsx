"use client";
import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";

const caseStudy = {
  client: "Family Fund",
  title: "Reinventing personal lending for the digital age",
  description: "A crowdfunding platform enabling friends and family to lend without traditional banking friction. We architected a custom payment infrastructure handling $2M+ in monthly transactions.",
  image: "/images/laptop.jpg", // Replace with your actual image path
  stats: [
    { label: "Users Onboarded", value: "1.5M" },
    { label: "Monthly Volume", value: "$2M+" },
    { label: "App Store Rating", value: "4.9" }
  ],
  tags: ["Fintech", "Web Platform", "Mobile App", "Payment Infrastructure"],
  color: "blue"
};

export default function FeaturedCaseStudy() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);
  const smoothImageY = useSpring(imageY, { stiffness: 100, damping: 30 });

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 lg:py-40 bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-50/50 -skew-x-12 translate-x-1/4" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
            Featured Case Study
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-7 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Link href="/work/family-fund" className="block relative group">
              <CornerFrame 
                className="relative aspect-[16/10] overflow-hidden bg-neutral-100"
                bracketClassName="w-6 h-6 border-2"
              >
                {/* Image with Parallax */}
                <motion.div 
                  style={{ y: smoothImageY, scale: imageScale }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 mix-blend-overlay z-10" />
                  <Image
                    src={caseStudy.image}
                    alt={caseStudy.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </motion.div>

                {/* Hover Overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  className="absolute inset-0 bg-neutral-950/60 z-20 flex items-center justify-center"
                >
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: isHovered ? 1 : 0.8, opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 text-white font-jetbrains-mono text-sm uppercase tracking-widest"
                  >
                    View Project
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </motion.span>
                </motion.div>

                {/* Floating Stats */}
                <div className="absolute bottom-4 left-4 right-4 z-30 flex gap-2 sm:gap-4">
                  {caseStudy.stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="flex-1 bg-white/90 backdrop-blur-sm p-2 sm:p-3 border border-white/20"
                    >
                      <div className="font-space-grotesk text-lg sm:text-xl font-semibold text-neutral-900">
                        {stat.value}
                      </div>
                      <div className="text-[8px] sm:text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-500">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CornerFrame>

              {/* Decorative Elements */}
              <motion.div 
                animate={{ 
                  rotate: isHovered ? 90 : 0,
                  scale: isHovered ? 1.2 : 1
                }}
                transition={{ duration: 0.5 }}
                className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-neutral-300"
              />
              <motion.div 
                animate={{ 
                  rotate: isHovered ? -90 : 0,
                  scale: isHovered ? 1.2 : 1
                }}
                transition={{ duration: 0.5 }}
                className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-neutral-300"
              />
            </Link>
          </motion.div>

          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-5"
          >
            {/* Client Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center">
                <span className="font-space-grotesk text-sm font-bold text-white">
                  {caseStudy.client.charAt(0)}
                </span>
              </div>
              <span className="font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-500">
                {caseStudy.client}
              </span>
            </motion.div>

            {/* Title */}
            <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-[0.95] mb-6">
              {caseStudy.title}
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed mb-8 font-light">
              {caseStudy.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-10">
              {caseStudy.tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + (i * 0.05) }}
                  whileHover={{ scale: 1.05, backgroundColor: "#171717", color: "#ffffff" }}
                  className="px-3 py-1.5 text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-600 bg-neutral-100 border border-neutral-200 transition-colors cursor-default"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* CTA */}
            <Link 
              href="/work/family-fund"
              className="group inline-flex items-center gap-3 font-jetbrains-mono text-sm uppercase tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              <span className="relative">
                Read Full Case Study
                <span className="absolute bottom-0 left-0 w-full h-px bg-neutral-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>

        {/* View All Projects Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 sm:mt-20 pt-8 border-t border-neutral-100 flex justify-between items-center"
        >
          <span className="text-sm text-neutral-400">01 / 06 Projects</span>
          <Link 
            href="/work"
            className="group flex items-center gap-2 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            View All Projects
            <span className="w-6 h-6 border border-neutral-300 group-hover:border-neutral-900 flex items-center justify-center transition-colors">
              <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}