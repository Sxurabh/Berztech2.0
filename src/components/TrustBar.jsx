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
    <section className="relative py-3 sm:py-4 bg-white border-t border-neutral-100">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Label - Responsive text size */}
          <span className="text-[9px] sm:text-[10px] font-jetbrains-mono uppercase tracking-widest text-neutral-400 shrink-0">
            Trusted by
          </span>

          {/* Client Marks - Scrollable on mobile if needed */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide">
            {clients.map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="group flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-default"
              >
                {/* Geometric Mark - Smaller on mobile */}
                <div className="w-5 h-5 sm:w-6 sm:h-6 border border-neutral-200 group-hover:border-neutral-400 transition-colors rounded flex items-center justify-center">
                  <span className="font-jetbrains-mono text-[8px] sm:text-[10px] font-bold text-neutral-400 group-hover:text-neutral-600 transition-colors">
                    {client.abbr}
                  </span>
                </div>
                <span className="hidden sm:block font-space-grotesk text-xs text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  {client.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Mobile: Simple indicator */}
          <div className="sm:hidden text-[9px] text-neutral-300">
            +
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}