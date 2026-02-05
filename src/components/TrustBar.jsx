// src/components/sections/TrustBar.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";

const clients = [
  { name: "Family Fund", abbr: "FF" },
  { name: "Unseal", abbr: "UN" },
  { name: "Phobia", abbr: "PH" },
  { name: "Bright Path", abbr: "BP" },
  { name: "Green Life", abbr: "GL" },
  { name: "North Adventures", abbr: "NA" },
];

export default function TrustBar() {
  return (
    <section className="relative py-12 sm:py-16 bg-white border-y border-neutral-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="shrink-0"
          >
            <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400">
              Trusted by
            </span>
          </motion.div>

          {/* Client Logos - Static Grid */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 sm:gap-x-12">
            {clients.map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="group flex items-center gap-2 cursor-default"
              >
                {/* Geometric Mark */}
                <div className="relative w-8 h-8 border border-neutral-200 group-hover:border-neutral-400 transition-colors duration-300 flex items-center justify-center">
                  <span className="font-jetbrains-mono text-xs font-bold text-neutral-400 group-hover:text-neutral-700 transition-colors">
                    {client.abbr}
                  </span>
                  {/* Corner accent on hover */}
                  <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Name - hidden on mobile, visible on sm+ */}
                <span className="hidden sm:block font-space-grotesk text-sm text-neutral-400 group-hover:text-neutral-700 transition-colors">
                  {client.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Count */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block shrink-0 text-right"
          >
            <span className="font-space-grotesk text-2xl font-medium text-neutral-900">50+</span>
            <span className="block text-[10px] font-jetbrains-mono text-neutral-400 uppercase tracking-wider">Projects</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}