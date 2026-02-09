"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";

export default function Newsletter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setNewsletterStatus("success");
      setNewsletterEmail("");
      setTimeout(() => setNewsletterStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-16 sm:mt-20"
    >
      <CornerFrame className="bg-neutral-950 text-white p-6 sm:p-8 lg:p-10" bracketClassName="w-4 h-4 border-neutral-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          <div>
            <h3 className="font-space-grotesk text-2xl sm:text-3xl font-medium mb-3">
              Stay in the loop
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Get our latest articles delivered to your inbox. No spam, just insights on building better digital products.
            </p>
          </div>
          
          <form className="relative flex gap-2" onSubmit={handleNewsletterSubmit}>
            <label htmlFor="blog-newsletter-email" className="sr-only">Email address</label>
            <input
              id="blog-newsletter-email"
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
              className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 text-white text-sm font-jetbrains-mono placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-colors disabled:opacity-70"
            />
            <button
              type="submit"
              disabled={newsletterStatus === "loading" || newsletterStatus === "success"}
              className="px-5 py-3 bg-white text-neutral-950 font-jetbrains-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px]"
            >
              {newsletterStatus === "loading" ? "..." : newsletterStatus === "success" ? "Joined" : "Subscribe"}
            </button>
            
            {newsletterStatus === "success" && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 text-xs text-emerald-500 font-medium"
              >
                Thanks for subscribing!
              </motion.p>
            )}
          </form>
        </div>
      </CornerFrame>
    </motion.div>
  );
}
