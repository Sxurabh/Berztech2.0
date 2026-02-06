// src/components/TrustBar.jsx
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
    <section className="relative py-4 sm:py-6 bg-white border-b border-neutral-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          {/* Label */}
          <span className="text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400 shrink-0">
            Trusted by
          </span>

          {/* Client Marks */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 overflow-hidden">
            {clients.map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="group flex items-center gap-2 shrink-0 cursor-default"
              >
                {/* Geometric Mark */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 border border-neutral-200 group-hover:border-neutral-400 transition-colors rounded flex items-center justify-center">
                  <span className="font-jetbrains-mono text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 transition-colors">
                    {client.abbr}
                  </span>
                </div>
                <span className="hidden sm:block font-space-grotesk text-xs text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  {client.name}
                </span>
              </motion.div>
            ))}
          </div>

        
        </div>
      </div>
    </section>
  );
}