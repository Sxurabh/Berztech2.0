// src/components/Footer.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CornerFrame } from "@/components/ui/CornerFrame";
import { serviceColors } from "@/lib/design-tokens";

// Assets
import blackLogo from "@/assets/Logo/blacklogo.png";
import compactLogoblack from "@/assets/Logo/CompactLogo-black.png";

import { socialLinks, footerLinks } from "@/data/navigation";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-2">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          aria-describedby="newsletter-description"
          className="flex-1 bg-neutral-50 border border-neutral-200 rounded px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-transparent focus:outline-none transition-all"
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="bg-neutral-900 text-white px-4 py-2 rounded text-xs font-jetbrains-mono uppercase tracking-wider font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : status === "success" ? (
            "Joined"
          ) : (
            "Join"
          )}
        </button>
      </div>
      {status === "success" && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 mt-1 text-xs text-emerald-600 font-medium"
        >
          Thanks for subscribing!
        </motion.p>
      )}
    </form>
  );
}

function LinkSection({ title, links }) {
  return (
    <div className="space-y-3">
      <h3 className="font-space-grotesk text-sm font-medium text-neutral-900">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-sm"
            >
              <span className="w-0 group-hover:w-2 h-px bg-neutral-900 transition-all duration-200" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileAccordion({ sections }) {
  const [openSection, setOpenSection] = useState(null);

  return (
    <div className="border-t border-neutral-200">
      {sections.map(([key, section]) => (
        <div key={key} className="border-b border-neutral-200">
          <button
            onClick={() => setOpenSection(openSection === key ? null : key)}
            className="w-full flex items-center justify-between py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-inset"
            aria-expanded={openSection === key}
          >
            <span className="font-space-grotesk text-sm font-medium text-neutral-900">
              {section.title}
            </span>
            <motion.span
              animate={{ rotate: openSection === key ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-neutral-600 text-lg font-light"
            >
              +
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {openSection === key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <ul className="pb-4 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block text-sm text-neutral-500 hover:text-neutral-900 transition-colors py-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative  overflow-hidden">
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">

            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-6">
              <Link href="/" className="inline-block">
                <Image
                  src={blackLogo}
                  alt="Berztech"
                  className="hidden sm:block h-7 w-auto"
                />
                <Image
                  src={compactLogoblack}
                  alt="Berztech"
                  className="block sm:hidden h-6 w-auto"
                />
              </Link>

              <p className="text-sm text-neutral-600 leading-relaxed max-w-xs">
                Engineering digital excellence for ambitious teams.
                We build products that matter.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-1">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                    aria-label={social.name}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>

              {/* Status Indicator */}
              <div className={`inline-flex items-center gap-2 px-3 py-2 border rounded ${serviceColors.emerald.bgLight} ${serviceColors.emerald.border}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${serviceColors.emerald.bg}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${serviceColors.emerald.bg}`} />
                </span>
                <span className={`text-xs font-jetbrains-mono uppercase tracking-wider ${serviceColors.emerald.text}`}>
                  Available for projects
                </span>
              </div>
            </div>

            {/* Links Columns - Desktop */}
            <div className="hidden lg:grid lg:col-span-5 grid-cols-3 gap-6">
              <LinkSection {...footerLinks.services} />
              <LinkSection {...footerLinks.company} />
              <LinkSection {...footerLinks.resources} />
            </div>

            {/* Newsletter Column */}
            <div className="lg:col-span-3 space-y-4">
              <div>
                <h3 className="font-space-grotesk text-sm font-medium text-neutral-900 mb-1">
                  Stay updated
                </h3>
                <p id="newsletter-description" className="text-xs text-neutral-500 leading-relaxed">
                  Get insights on engineering, design, and digital strategy.
                </p>
              </div>

              <NewsletterForm />

              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span>No spam, ever</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span>Unsubscribe anytime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Accordion Links */}
          <div className="lg:hidden mt-10">
            <MobileAccordion sections={Object.entries(footerLinks)} />
          </div>

          {/* Contact Info Bar */}
          <div className="mt-6 pt-4 ">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-neutral-600">
                <a
                  href="mailto:hello@berztech.com"
                  className="hover:text-neutral-900 transition-colors font-jetbrains-mono text-xs uppercase tracking-wider"
                >
                  hello@berztech.com
                </a>
                <span className="hidden sm:inline text-neutral-300">·</span>
                <span className="text-xs text-neutral-500">Pune, India</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-jetbrains-mono text-neutral-500">
                <span className="uppercase tracking-wider">Response time: ~4hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs font-jetbrains-mono text-neutral-500">
              © {currentYear} Berzcode technologies pvt. ltd.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
              >
                Terms
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group flex items-center gap-1 text-xs font-jetbrains-mono text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 rounded-sm"
                aria-label="Scroll to top"
              >
                Top
                <motion.span
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ↑
                </motion.span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}