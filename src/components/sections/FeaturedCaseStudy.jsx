// src/components/FeaturedCaseStudy.jsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { CornerFrame } from "@/components/ui/CornerFrame";
import GridBackground from "@/components/ui/GridBackground"; // 1. Import this


const caseStudy = {
  client: "Family Fund",
  title: "Reinventing personal lending",
  description: "A crowdfunding platform enabling friends and family to lend without traditional banking friction. Custom payment infrastructure handling $2M+ monthly.",
  image: "/images/laptop.jpg",
  stats: [
    { label: "Users", value: "1.5M" },
    { label: "Volume", value: "$2M+" },
    { label: "Rating", value: "4.9" }
  ],
  tags: ["Fintech", "Web", "Mobile", "Payments"],
  service: "Web development, CMS"
};

export default function FeaturedCaseStudy() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-4 bg-neutral-300" />
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-600">
              Featured Work
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2 className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-tight leading-tight">
              Proven solutions for<br />
              <span className="text-neutral-500">real-world problems</span>
            </h2>
            <Link 
              href="/work"
              className="group inline-flex items-center gap-2 text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-600 hover:text-neutral-900 transition-colors shrink-0"
            >
              View all projects
              <span className="w-4 h-px bg-neutral-300 group-hover:w-5 group-hover:bg-neutral-900 transition-all" />
            </Link>
          </div>
        </motion.div>

        {/* Case Study Card - Compact Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <CornerFrame 
            className="bg-neutral-50 border-neutral-200 hover:border-neutral-300 transition-colors overflow-hidden"
            bracketClassName="w-4 h-4 sm:w-5 sm:h-5 border-neutral-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* Image Side */}
              <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-neutral-100">
                <motion.div
                  animate={{ scale: isHovered ? 1.05 : 1 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={caseStudy.image}
                    alt={caseStudy.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neutral-50/20 lg:to-neutral-50/50" />
                </motion.div>
                
                {/* Service Badge - Top Left */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-jetbrains-mono uppercase tracking-wider text-neutral-600 border border-neutral-200">
                    {caseStudy.service}
                  </span>
                </div>
              </div>

              {/* Content Side */}
              <div className="lg:col-span-7 p-4 sm:p-5 lg:p-6 flex flex-col justify-between">
                <div>
                  {/* Client & Title */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-neutral-900 flex items-center justify-center">
                      <span className="font-space-grotesk text-xs font-bold text-white">
                        {caseStudy.client.charAt(0)}
                      </span>
                    </div>
                    <span className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-600">
                      {caseStudy.client}
                    </span>
                  </div>

                  <h3 className="font-space-grotesk text-xl sm:text-2xl font-medium text-neutral-900 tracking-tight mb-2">
                    {caseStudy.title}
                  </h3>
                  
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                    {caseStudy.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {caseStudy.tags.map((tag, i) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        whileHover={{ backgroundColor: "#171717", color: "#ffffff" }}
                        className="px-2 py-1 text-[9px] font-jetbrains-mono uppercase tracking-wider text-neutral-600 bg-white border border-neutral-200 transition-colors cursor-default"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Stats Row - Compact */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                  <div className="flex items-center gap-4 sm:gap-6">
                    {caseStudy.stats.map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="text-center"
                      >
                        <div className="font-space-grotesk text-lg sm:text-xl font-medium text-neutral-900">
                          {stat.value}
                        </div>
                        <div className="text-[9px] font-jetbrains-mono uppercase tracking-wider text-neutral-600">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link 
                    href="/work/family-fund"
                    className="group inline-flex items-center gap-2 font-jetbrains-mono text-xs uppercase tracking-widest text-neutral-900 hover:text-neutral-600 transition-colors"
                  >
                    <span className="hidden sm:inline">View Case Study</span>
                    <span className="sm:hidden">View</span>
                    <motion.span
                      animate={{ x: isHovered ? [0, 3, 0] : 0 }}
                      transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
                    >
                      →
                    </motion.span>
                  </Link>
                </div>
              </div>
            </div>
          </CornerFrame>
        </motion.div>

        {/* Bottom Mini Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 sm:mt-8 grid grid-cols-3 gap-4"
        >
          {[
            { value: "50+", label: "Projects" },
            { value: "12", label: "Industries" },
            { value: "4.9", label: "Avg Rating" }
          ].map((item, i) => (
            <div key={item.label} className="text-center">
              <div className="font-space-grotesk text-xl sm:text-2xl font-medium text-neutral-900">
                {item.value}
              </div>
              <div className="text-[10px] font-jetbrains-mono uppercase tracking-wider text-neutral-600 mt-0.5">
                {item.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}