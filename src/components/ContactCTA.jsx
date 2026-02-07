// src/components/ContactCTA.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CornerFrame } from "@/components/CornerFrame";
import GridBackground from "@/components/GridBackground"; // 1. Import this


export default function ContactCTA() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 bg-white ">
            <GridBackground opacity={0.05} size={40} />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-4 bg-neutral-300" />
              <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
                Start Your Project
              </span>
            </div>

            <h2 className="font-space-grotesk text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-900 tracking-tight leading-tight mb-4">
              Let&apos;s build something
              <br />
              <span className="text-neutral-400">extraordinary together</span>
            </h2>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-lg mb-6">
              Book a 30-minute discovery call. We&apos;ll discuss your challenges, explore solutions, and outline a path forward—no commitment required.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link href="/contact">
                <CornerFrame 
                  className="inline-block bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800 transition-colors"
                  bracketClassName="w-3 h-3 border-white/30"
                >
                  <span className="flex items-center gap-2 px-5 py-3 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold">
                    Schedule a Call
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </CornerFrame>
              </Link>

              <Link href="/work" className="group inline-flex items-center gap-2 text-xs font-jetbrains-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                View Our Work
                <span className="w-4 h-px bg-neutral-300 group-hover:w-5 group-hover:bg-neutral-900 transition-all" />
              </Link>
            </div>
          </motion.div>

          {/* Right: Quick Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <CornerFrame className="bg-neutral-50 border-neutral-200 p-4 sm:p-5" bracketClassName="w-3 h-3 border-neutral-300">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-emerald-600 text-sm">✓</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-neutral-900">Free Discovery Call</span>
                    <span className="text-[10px] text-neutral-500">30 minutes, no commitment</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 text-sm">⚡</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-neutral-900">Fast Response</span>
                    <span className="text-[10px] text-neutral-500">Within 24 hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-purple-600 text-sm">◆</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-neutral-900">Clear Pricing</span>
                    <span className="text-[10px] text-neutral-500">Transparent from day one</span>
                  </div>
                </div>
              </div>
            </CornerFrame>
          </motion.div>
        </div>

        
      </div>
    </section>
  );
}